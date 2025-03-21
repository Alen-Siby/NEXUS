import React, { useState } from 'react';
import SummaryApi from '../common';
import { FiDownload, FiShare2, FiSend, FiHeart } from 'react-icons/fi';

const SocialMedia = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactInfo: '',
    theme: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    eventType: '',
    eventDate: '',
    brideName: '',
    groomName: '',
    individualName: '',
    photo: null,
    prompt: '',
  });

  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  // Generate poster via API
  const generatePoster = async (prompt) => {
    try {
      const response = await fetch(SummaryApi.generatePoster.url, {
        method: SummaryApi.generatePoster.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate poster.');
      }

      const data = await response.json();
      return data.posters || [];
    } catch (error) {
      console.error('Error generating poster:', error);
      throw new Error('Failed to generate poster. Please try again.');
    }
  };

  // Create AI prompt
  const createAIPrompt = (data) => {
    let prompt = `Create a ${data.eventType} poster`;
    
    // Add poster type specification
    if (activeButton) {
      prompt += ` in ${activeButton} style`;
    }
    
    // Add theme and colors
    prompt += ` with the theme "${data.theme}". Use ${data.primaryColor} as the primary color and ${data.secondaryColor} as the secondary color.`;
    
    // Add event date
    if (data.eventDate) {
      prompt += ` The event will take place on ${data.eventDate}.`;
    }
    
    // Add event-specific details
    if (data.eventType === 'marriage' || data.eventType === 'wedding') {
      prompt += ` For the wedding of bride "${data.brideName}" and groom "${data.groomName}".`;
    } else if (data.eventType === 'baptism' || data.eventType === 'babyShower') {
      prompt += ` For ${data.individualName}.`;
    }

    // Add contact information
    prompt += ` Include contact information: ${data.contactInfo}.`;

    // Add any additional custom prompt
    if (data.prompt) {
      prompt += ` Additional specifications: ${data.prompt}`;
    }

    console.log('Generated AI Prompt:', prompt);
    return prompt;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activeButton) {
      alert('Please select either Static or Dynamic poster type');
      return;
    }

    setLoading(true);

    try {
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'photo') {
          if (formData.photo) {
            formDataToSend.append('photo', formData.photo);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append poster type
      formDataToSend.append('posterType', activeButton);

      // Update fetch call to use FormData
      const response = await fetch(SummaryApi.generatePoster.url, {
        method: SummaryApi.generatePoster.method,
        credentials: 'include',
        // Remove Content-Type header to let browser set it with boundary for FormData
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate poster');
      }

      const data = await response.json();
      if (data.success) {
        setPosters(data.posters);
        console.log('Generated images:', data.posters);
        console.log('Used prompt:', data.prompt); // For debugging
      } else {
        throw new Error('Failed to generate poster');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePosterTypeClick = (buttonType) => {
    if (activeButton === buttonType) {
      setActiveButton(null);
    } else {
      setActiveButton(buttonType);
    }
  };

  // Handle image download
  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poster-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image');
    }
  };

  return (
    <div className="container my-11 mx-auto p-6 bg-gray-100 rounded-lg shadow-lg max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Event Poster Generator</h1>
      
      {/* Form Container with reduced width */}
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                type="text"
                name="contactInfo"
                placeholder="Contact Information"
                value={formData.contactInfo}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Theme and Colors Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Theme & Colors</h2>
            <input
              type="text"
              name="theme"
              placeholder="Theme"
              value={formData.theme}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                  Primary Color
                </label>
                <input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="w-full h-10 p-1 border border-gray-300 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                  Secondary Color
                </label>
                <input
                  type="color"
                  id="secondaryColor"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                  className="w-full h-10 p-1 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Event Details Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Event Details</h2>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Event Type</option>
              {/* Wedding & Relationship Events */}
              <option value="marriage">Marriage</option>
              <option value="wedding">Wedding</option>
              <option value="engagement">Engagement</option>
              <option value="anniversary">Anniversary</option>
              <option value="bridal">Bridal Shower</option>
              <option value="bachelor">Bachelor Party</option>
              <option value="bachelorette">Bachelorette Party</option>
              
              {/* Family Events */}
              <option value="baptism">Baptism</option>
              <option value="babyShower">Baby Shower</option>
              <option value="genderReveal">Gender Reveal</option>
              <option value="birthday">Birthday</option>
              <option value="familyReunion">Family Reunion</option>
              <option value="memorial">Memorial Service</option>
              <option value="funeral">Funeral</option>
              
              {/* Academic Events */}
              <option value="graduation">Graduation</option>
              <option value="backToSchool">Back to School</option>
              <option value="schoolDance">School Dance</option>
              <option value="prom">Prom</option>
              <option value="homecoming">Homecoming</option>
              
              {/* Professional Events */}
              <option value="conference">Conference</option>
              <option value="seminar">Seminar</option>
              <option value="workshop">Workshop</option>
              <option value="networking">Networking Event</option>
              <option value="productLaunch">Product Launch</option>
              <option value="tradeShow">Trade Show</option>
              <option value="jobFair">Job Fair</option>
              
              {/* Entertainment Events */}
              <option value="concert">Concert</option>
              <option value="festival">Festival</option>
              <option value="movieScreening">Movie Screening</option>
              <option value="artExhibition">Art Exhibition</option>
              <option value="theaterPlay">Theater Play</option>
              <option value="comedyShow">Comedy Show</option>
              <option value="danceRecital">Dance Recital</option>
              
              {/* Community Events */}
              <option value="fundraiser">Fundraiser</option>
              <option value="charity">Charity Event</option>
              <option value="bloodDrive">Blood Drive</option>
              <option value="foodDrive">Food Drive</option>
              <option value="communityMeeting">Community Meeting</option>
              <option value="townHall">Town Hall</option>
              <option value="protest">Protest/Rally</option>
              
              {/* Sports & Recreation */}
              <option value="sportsTournament">Sports Tournament</option>
              <option value="marathon">Marathon/Race</option>
              <option value="gameNight">Game Night</option>
              <option value="campingTrip">Camping Trip</option>
              <option value="retreat">Retreat</option>
              
              {/* Seasonal & Holiday Events */}
              <option value="halloween">Halloween Party</option>
              <option value="christmas">Christmas Celebration</option>
              <option value="newYear">New Year's Party</option>
              <option value="thanksgiving">Thanksgiving Gathering</option>
              <option value="easter">Easter Event</option>
              <option value="holidayParty">Holiday Party</option>
              
              {/* Other Events */}
              <option value="grandOpening">Grand Opening</option>
              <option value="housewarming">Housewarming</option>
              <option value="retirement">Retirement Party</option>
              <option value="reunion">Class Reunion</option>
              <option value="farewell">Farewell Party</option>
              <option value="virtualEvent">Virtual Event</option>
              <option value="other">Other Event</option>
            </select>

            {/* Date field for all event types */}
            <div className="space-y-2">
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
                Event Date
              </label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {(formData.eventType === 'marriage' || formData.eventType === 'wedding') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="brideName"
                  placeholder="Bride's Name"
                  value={formData.brideName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  name="groomName"
                  placeholder="Groom's Name"
                  value={formData.groomName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            {(formData.eventType === 'baptism' || formData.eventType === 'babyShower') && (
              <input
                type="text"
                name="individualName"
                placeholder="Name of Individual"
                value={formData.individualName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            )}
          </div>

          {/* Additional Options Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Additional Options</h2>
            <div className="space-y-4">
              <input
                type="file"
                name="photo"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                name="prompt"
                placeholder="Additional Prompt (Optional)"
                value={formData.prompt}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
              ></textarea>
            </div>
          </div>

          {/* Poster Type Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Poster Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`p-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group ${
                  activeButton === 'static' 
                    ? 'bg-green-600 text-white transform scale-95 shadow-inner' 
                    : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50'
                }`}
                onClick={() => handlePosterTypeClick('static')}
              >
                <svg 
                  className={`w-6 h-6 transition-transform duration-300 ${
                    activeButton === 'static' ? 'scale-90' : 'group-hover:scale-110'
                  }`}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    className="transition-all duration-500"
                    d="M4 16L8 12L12 16L20 8" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    strokeDasharray="30"
                    strokeDashoffset={activeButton === 'static' ? "0" : "30"}
                  />
                </svg>
                Static Poster
              </button>
              <button
                type="button"
                className={`p-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group ${
                  activeButton === 'dynamic' 
                    ? 'bg-purple-600 text-white transform scale-95 shadow-inner' 
                    : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
                }`}
                onClick={() => handlePosterTypeClick('dynamic')}
              >
                <svg 
                  className={`w-6 h-6 transition-transform duration-300 ${
                    activeButton === 'dynamic' 
                      ? 'animate-spin-slow' 
                      : 'group-hover:animate-spin-slow'
                  }`}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle 
                    className="transition-all duration-500"
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeDasharray="63"
                    strokeDashoffset={activeButton === 'dynamic' ? "0" : "63"}
                  >
                    {activeButton === 'dynamic' && (
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 12 12"
                        to="360 12 12"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                  <path
                    className={`transition-opacity duration-300 ${
                      activeButton === 'dynamic' ? 'opacity-100' : 'opacity-0'
                    }`}
                    d="M12 6v6l4 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Dynamic Poster
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Poster'
            )}
          </button>
        </form>
      </div>

      {/* Updated Posters Display Section */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {posters.map((poster, index) => (
          <div key={index} className="relative group">
            <div 
              className="cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              onClick={() => setSelectedImage(poster)}
            >
              <img
                src={poster}
                alt={`Poster ${index + 1}`}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Modal for expanded image */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-6xl w-full h-full flex items-center">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-2xl z-50"
            >
              ×
            </button>

            {/* Image */}
            <div className="relative flex-1 h-full flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Expanded poster"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Action buttons */}
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-6">
              <button
                onClick={() => handleDownload(selectedImage)}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="Download"
              >
                <FiDownload className="w-6 h-6 text-gray-800" />
              </button>
              
              <button
                onClick={() => {
                  // Add share functionality
                  if (navigator.share) {
                    navigator.share({
                      title: 'Event Poster',
                      url: selectedImage
                    });
                  }
                }}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="Share"
              >
                <FiShare2 className="w-6 h-6 text-gray-800" />
              </button>

              <button
                onClick={() => {
                  // Add post functionality
                  console.log('Post clicked');
                }}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="Post"
              >
                <FiSend className="w-6 h-6 text-gray-800" />
              </button>

              <button
                onClick={() => {
                  // Add favorite functionality
                  console.log('Favorite clicked');
                }}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="Favorite"
              >
                <FiHeart className="w-6 h-6 text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMedia;
