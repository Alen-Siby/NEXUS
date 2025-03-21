require('dotenv').config();
const axios = require('axios');
const sharp = require('sharp');

/**
 * Generate Poster Controller
 */
const generatePoster = async (req, res) => {
  try {
    const completeFormData = req.body;
    const photo = req.files?.photo;

    // Build base prompt based on event type without mentioning theme explicitly
    let basePrompt = `Create a professional ${completeFormData.eventType} poster`;
    
    // Add poster type specification
    if (completeFormData.posterType) {
      basePrompt += ` in ${completeFormData.posterType} style`;
    }

    // Add colors without mentioning theme
    basePrompt += `. Use ${completeFormData.primaryColor} as the main color with ${completeFormData.secondaryColor} as accent color.`;

    // Add event-specific details
    if (completeFormData.eventType === 'marriage' || completeFormData.eventType === 'wedding') {
      basePrompt += ` Design an elegant wedding celebration poster for ${completeFormData.brideName} and ${completeFormData.groomName}.`;
      if (completeFormData.eventDate) {
        basePrompt += ` The wedding will take place on ${completeFormData.eventDate}.`;
      }
      if (photo) {
        basePrompt += ` Incorporate their photo in a central, prominent position with decorative elements around it.`;
      }
    } else if (completeFormData.eventType === 'baptism' || completeFormData.eventType === 'babyShower') {
      basePrompt += ` Create a heartwarming celebration poster for ${completeFormData.individualName}.`;
      if (completeFormData.eventDate) {
        basePrompt += ` The event will take place on ${completeFormData.eventDate}.`;
      }
      if (photo) {
        basePrompt += ` Feature their photo as the centerpiece of the design with gentle decorative elements.`;
      }
    } else {
      // For other event types (birthday, anniversary, graduation, etc.)
      if (completeFormData.individualName) {
        basePrompt += ` Create an engaging poster for ${completeFormData.individualName}'s ${completeFormData.eventType}.`;
      } else {
        basePrompt += ` Create an engaging ${completeFormData.eventType} poster.`;
      }
      if (completeFormData.eventDate) {
        basePrompt += ` The event will take place on ${completeFormData.eventDate}.`;
      }
      if (photo) {
        basePrompt += ` Incorporate the provided photo prominently in the design.`;
      }
    }

    // Use the theme for style guidance without displaying it
    basePrompt += ` Style the poster with ${completeFormData.theme} elements but don't write the theme name.`;

    // Add any additional custom prompt
    if (completeFormData.prompt) {
      basePrompt += ` Additional design elements: ${completeFormData.prompt}`;
    }

    let images = [];

    try {
      // Generate multiple images using Pollinations.ai
      const numberOfImages = 3;

      for (let i = 0; i < numberOfImages; i++) {
        // Encode the prompt for URL
        const encodedPrompt = encodeURIComponent(basePrompt);
        
        // Create image generation URL with different seeds for variety
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
        
        // Get image as buffer
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        
        // If this is the first image and we have a photo, composite it with the generated poster
        if (i === 0 && photo) {
          try {
            // Process the uploaded photo
            const processedPhoto = await sharp(photo.data)
              .resize(400, 400, { // Adjust size as needed
                fit: 'inside',
                withoutEnlargement: true
              })
              .toBuffer();

            // Composite the photo onto the generated poster
            const compositeImage = await sharp(response.data)
              .composite([
                {
                  input: processedPhoto,
                  gravity: 'center', // Place in center
                  blend: 'over'
                }
              ])
              .toBuffer();

            const base64 = compositeImage.toString('base64');
            images.push(`data:image/jpeg;base64,${base64}`);
          } catch (compositeError) {
            console.error('Error compositing images:', compositeError);
            // Fallback to original generated image if compositing fails
            const base64 = Buffer.from(response.data).toString('base64');
            images.push(`data:image/jpeg;base64,${base64}`);
          }
        } else {
          // For other images, just use the generated poster
          const base64 = Buffer.from(response.data).toString('base64');
          images.push(`data:image/jpeg;base64,${base64}`);
        }
      }

    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      throw new Error('Failed to generate images: ' + aiError.message);
    }

    res.status(200).json({ 
      success: true,
      posters: images,
      prompt: basePrompt,
      message: 'Posters generated successfully'
    });

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    res.status(500).json({ 
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};

module.exports = { generatePoster };
