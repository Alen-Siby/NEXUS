const GuestList = require('../../models/GuestList');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

const createGuestList = async (req, res) => {
  try {
    const {
      eventName,
      eventType,
      eventDate,
      welcomeNote,
      dressCode,
      location,
      latitude,
      longitude,
      locationName,
      vendor,
      uniqueId
    } = req.body;

    // Ensure vendor is a string, take the first element if it's an array
    const vendorString = Array.isArray(vendor) ? vendor[0] : vendor;

    // Validate required fields
    if (!eventName || !eventType || !eventDate || !location || !vendorString) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    let guests = [];
    let emailList = [];

    // Handle file upload if present
    if (req.files && req.files.guestList) {
      const file = req.files.guestList;
      const fileExt = path.extname(file.name).toLowerCase();

      // Create temp file path
      const tempDir = path.join(__dirname, '../../temp');
      const tempPath = path.join(tempDir, file.name);

      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Move the uploaded file to the temp directory
      await file.mv(tempPath);

      try {
        // Parse CSV file
        if (fileExt === '.csv') {
          guests = await new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(tempPath)
              .pipe(csv())
              .on('data', (data) => {
                results.push(data);
                if (data.email) {
                  emailList.push(data.email);
                }
              })
              .on('end', () => resolve(results))
              .on('error', (error) => reject(error));
          });
        }
        // Parse Excel file
        else if (fileExt === '.xlsx' || fileExt === '.xls') {
          const workbook = xlsx.readFile(tempPath);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          guests = xlsx.utils.sheet_to_json(worksheet);
          guests.forEach(guest => {
            if (guest.email) {
              emailList.push(guest.email);
            }
          });
        } else {
          throw new Error('Unsupported file format');
        }

        // Clean up temp file if needed
        // fs.unlinkSync(tempPath); // Uncomment if you want to delete the file after reading

      } catch (error) {
        // Clean up temp file in case of error
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        throw new Error(`Error processing file: ${error.message}`);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'No guest list file uploaded'
      });
    }

    // Create new guest list
    const newGuestList = new GuestList({
      eventName,
      eventType,
      eventDate,
      welcomeNote,
      dressCode,
      location: {
        address: location,
        coordinates: {
          latitude: parseFloat(latitude) || 0,
          longitude: parseFloat(longitude) || 0
        },
        locationName
      },
      vendor: vendorString,
      uniqueId,
      guests: await Promise.all(guests.map(async guest => {
        // Generate a unique ID for the guest
        const randomStr = Math.random().toString(36).substring(2, 8); // Generate a random string
        const qrCodeUniqueId = `${uniqueId}-${randomStr}`; // Append to uniqueId

        const qrCodeData = JSON.stringify({
          eventName,
          eventType,
          eventDate,
          dressCode,
          location,
          locationName,
          guestName: guest.name || guest.Name || '',
          guestEmail: guest.email || guest.Email,
          qrCodeUniqueId // Include the new unique ID in the QR code data
        });

        // Generate QR code URL using GoQR API
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeData)}&size=150x150`;

        return {
          name: guest.name || guest.Name || '',
          email: guest.email || guest.Email || '',
          phone: guest.phone || guest.Phone || guest.phoneNumber || guest.PhoneNumber || '',
          status: guest.status || guest.Status || 'Pending',
          additionalInfo: guest,
          qrCode: qrCodeUrl // Store the QR code URL in the guest object
        };
      }))
    });

    // Save to database
    await newGuestList.save();

    // Generate QR codes and update the CSV file
    const updatedGuests = await generateQRCodesAndUpdateCSV(guests, {
      eventName,
      eventType,
      eventDate,
      welcomeNote,
      dressCode,
      location,
      locationName,
      latitude,
      longitude,
      uniqueId
    });

    // Send invitation emails
    await sendInvitationEmails(emailList, {
      eventName,
      eventType,
      eventDate,
      welcomeNote,
      dressCode,
      location,
      locationName,
      latitude,
      longitude
    }, updatedGuests);

    res.status(201).json({
      success: true,
      message: 'Guest list created successfully and invitations sent',
      data: {
        uniqueId: newGuestList.uniqueId,
        eventName: newGuestList.eventName,
        guestCount: updatedGuests.length
      }
    });

  } catch (error) {
    console.error('Error in createGuestList:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating guest list'
    });
  }
};

// Function to generate QR codes and update the CSV file
const generateQRCodesAndUpdateCSV = async (guests, eventDetails) => {
  const updatedGuests = [];

  for (const guest of guests) {
    // Generate a random alphanumeric string
    const randomStr = Math.random().toString(36).substring(2, 8); // Generate a random string
    const qrCodeUniqueId = `${eventDetails.uniqueId}-${randomStr}`; // Append to uniqueId

    const qrCodeData = JSON.stringify({
      eventName: eventDetails.eventName,
      eventType: eventDetails.eventType,
      eventDate: eventDetails.eventDate,
      dressCode: eventDetails.dressCode,
      location: eventDetails.location,
      locationName: eventDetails.locationName,
      guestName: guest.name || guest.Name || '',
      guestEmail: guest.email || guest.Email || '',
      qrCodeUniqueId // Include the new unique ID in the QR code data
    });

    // Generate QR code as a data URL
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Append the QR code image URL to the guest object
    guest.qrCode = qrCodeImage;

    updatedGuests.push(guest);
  }

  // Convert updated guests to CSV format
  const csvWriter = require('csv-writer').createObjectCsvWriter({
    path: path.join(__dirname, '../../temp/updated_guest_list.csv'), // Path to save the updated CSV
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'status', title: 'Status' },
      { id: 'qrCode', title: 'QR Code' } // Add QR Code column
    ]
  });

  await csvWriter.writeRecords(updatedGuests); // Write the updated records to the CSV file

  return updatedGuests; // Return the updated guests
};

// Function to send invitation emails
const sendInvitationEmails = async (emailList, eventDetails, guests) => {
  // Create a transporter object using SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Use Gmail SMTP server
    port: 587, // Use port 587 for TLS
    secure: false, // Set to true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL, // your email
      pass: process.env.EMAIL_PASSWORD,// Your email password or app password
    }
  });

  // Create a Google Maps link for the location
  const mapsLink = `https://www.google.com/maps?q=${eventDetails.latitude},${eventDetails.longitude}`;

  // Log the location URL to the console
  console.log('Location URL:', mapsLink);

  // Send email to each address in the email list
  for (const guest of guests) {
    // Generate a unique ID for the guest
    const uniqueGuestId = `${eventDetails.uniqueId}-${guest.email || guest.Email}-${Date.now()}`;

    const qrCodeData = JSON.stringify({
      eventName: eventDetails.eventName,
      eventType: eventDetails.eventType,
      eventDate: eventDetails.eventDate,
      dressCode: eventDetails.dressCode,
      location: eventDetails.location,
      locationName: eventDetails.locationName,
      guestName: guest.name || guest.Name || '',
      guestEmail: guest.email || guest.Email,
      uniqueId: uniqueGuestId // Include the unique ID for the guest
    });

    // Generate QR code URL using GoQR API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeData)}&size=150x150`;

    // Footer content
    const footer = `
      <div style="font-size: small; text-align: center; margin-top: 20px;">
          <p>powered by</p>
          <img src="https://res.cloudinary.com/du8ogkcns/image/upload/v1726763193/n5swrlk0apekdvwsc2w5.png" style="width: 50px; height: auto;" />
      </div>
    `;

    // Email options
    const mailOptions = {
      from: '"Event Organizer" <your-email@example.com>', // Sender address
      subject: `You're Invited to ${eventDetails.eventName}!`, // Subject line
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #ddd;">
          <h1 style="color: #4CAF50; font-size: 24px;">You're Invited to ${eventDetails.eventName}!</h1>
          <p style="font-size: 20px; margin: 20px 0;">Join us for a fun-filled event!</p>
          <h2 style="color: #333; font-size: 22px;">Event Details:</h2>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin: 15px 0;">
              <img src="https://res.cloudinary.com/du8ogkcns/image/upload/v1740929444/images_lcgt66.png" alt="Event Type" style="width: 40px; vertical-align: middle;"/> 
              <strong style="font-size: 16px;">Event Type:</strong> <span style="font-size: 20px;">${eventDetails.eventType}</span>
            </li>
            <li style="margin: 15px 0;">
              <img src="https://res.cloudinary.com/du8ogkcns/image/upload/v1740929444/5398602_cj9rbx.png" alt="Event Date" style="width: 40px; vertical-align: middle;"/> 
              <strong style="font-size: 16px;">Event Date:</strong> <span style="font-size: 20px;">${eventDetails.eventDate}</span>
              <p style="font-size: 14px; color: #555;">Mark your calendar: <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.eventName)}&dates=${formatDateForCalendar(eventDetails.eventDate)}&details=${encodeURIComponent(eventDetails.welcomeNote)}&location=${encodeURIComponent(eventDetails.location)}" target="_blank" style="color: #4CAF50; text-decoration: none;">Add to Calendar</a></p>
            </li>
            <li style="margin: 15px 0;">
              <img src="https://res.cloudinary.com/du8ogkcns/image/upload/v1740929444/pngtree-casual-dress-code-icon-image-vector-png-image_6635487_hawbnz.png" alt="Dress Code" style="width: 40px; vertical-align: middle;"/> 
              <strong style="font-size: 16px;">Dress Code:</strong> <span style="font-size: 20px;">${eventDetails.dressCode}</span>
            </li>
            <li style="margin: 15px 0;">
              <img src="https://res.cloudinary.com/du8ogkcns/image/upload/v1740929444/transparent-location-icon-map-with-users-location-and-nearby-1710881914600_xxr2n7.webp" alt="Location" style="width: 40px; vertical-align: middle;"/> 
              <strong style="font-size: 16px;">Location:</strong> <span style="font-size: 20px;"><a href="${mapsLink}" target="_blank" style="color: #4CAF50; text-decoration: none;">${eventDetails.locationName}</a></span>
              <p style="font-size: 14px; color: #555;">Join us at this beautiful venue located at ${eventDetails.location}. We look forward to seeing you there!</p>
              <a href="${mapsLink}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Open Map</a>
            </li>
          </ul>
          <h2 style="color: #333; font-size: 22px;">Event Descriptions:</h2>
          <p style="font-size: 16px; color: #555;">This event is a ${eventDetails.eventType}, designed to bring people together for a memorable experience. Mark your calendar for this special day! We can't wait to celebrate with you. Dress to impress! We encourage you to wear ${eventDetails.dressCode} to match the theme of the event.</p>
          <p style="font-size: 18px;">${eventDetails.welcomeNote}</p>
          <p style="font-size: 20px; margin: 20px 0;">We look forward to seeing you there!</p>
          <p style="font-size: 18px;">Best Regards,<br>Your Event Team</p>
          <p style="font-size: 18px;">Your unique entry ticket:</p>
          <img src="${qrCodeUrl}" alt="QR Code" style="width: 150px; height: 150px; border: 2px solid #4CAF50; border-radius: 10px; margin-top: 10px;" />
          <p style="font-size: 16px; margin-top: 20px;">Feel free to reach out if you have any questions or need further information. We are here to help!</p>
          ${footer}
        </div>
      `
    };

    await transporter.sendMail({ ...mailOptions, to: guest.email || guest.Email });
  }
};

// Helper function to format date for Google Calendar
const formatDateForCalendar = (eventDate) => {
  const date = new Date(eventDate);
  const startDate = date.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "00"; // Format: YYYYMMDDTHHMM00
  const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "00"; // 2 hours later
  return `${startDate}/${endDate}`;
};

// Get guest list by unique ID
const getGuestList = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const guestList = await GuestList.findOne({ uniqueId });

    if (!guestList) {
      return res.status(404).json({
        success: false,
        message: 'Guest list not found'
      });
    }

    res.status(200).json({
      success: true,
      data: guestList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all guest lists for a vendor
const getVendorGuestLists = async (req, res) => {
  try {
    const { vendor } = req.params;
    const guestLists = await GuestList.find({ vendor })
      .select('eventName eventType eventDate uniqueId location.address guestCount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: guestLists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update guest status
const updateGuestStatus = async (req, res) => {
  try {
    const { uniqueId, guestId } = req.params;
    const { status } = req.body;

    const guestList = await GuestList.findOne({ uniqueId });
    if (!guestList) {
      return res.status(404).json({
        success: false,
        message: 'Guest list not found'
      });
    }

    const guest = guestList.guests.id(guestId);
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    guest.status = status;
    await guestList.save();

    res.status(200).json({
      success: true,
      message: 'Guest status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createGuestList,
  getGuestList,
  getVendorGuestLists,
  updateGuestStatus
};