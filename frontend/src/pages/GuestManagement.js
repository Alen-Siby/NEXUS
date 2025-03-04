import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUpload, FiZap, FiEye, FiPlusCircle, FiSearch, FiUser, FiMail, FiPhone, FiCheckCircle, FiXCircle, FiCalendar, FiClipboard, FiTag, FiMapPin, FiMap, FiCompass, FiClock, FiKey, FiUserCheck, FiDownload } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';
import SummaryApi from '../common';
import ExcelJS from 'exceljs';

const GuestManagement = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    eventDate: '',
    welcomeNote: '',
    dressCode: '',
    location: '',
    guestList: null,
    latitude: '',
    longitude: '',
    locationName: '',
    vendor: ''
  });

  const [loading, setLoading] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [position, setPosition] = useState([10.8505, 76.2711]); // Default to Kerala coordinates
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({
    headers: [],
    rows: []
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [uniqueIds, setUniqueIds] = useState([]);
  const [filteredIds, setFilteredIds] = useState([]);
  const [idColorMap, setIdColorMap] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGuestList, setSelectedGuestList] = useState(null);
  const [guestLists, setGuestLists] = useState([]);

  // Define an array of colors for the containers (15 colors)
  const colors = [
    'bg-blue-400',
    'bg-green-400',
    'bg-red-400',
    'bg-yellow-400',
    'bg-purple-400',
    'bg-pink-400',
    'bg-teal-400',
    'bg-orange-400',
    'bg-indigo-400',
    'bg-rose-400',
    'bg-lime-400',
    'bg-emerald-400',
    'bg-cyan-400',
    'bg-sky-400',
    'bg-fuchsia-400',
  ];

  // Event types
  const eventTypes = [
    'Wedding',
    'Birthday Party',
    'Corporate Event',
    'Baby Shower',
    'Graduation',
    'Anniversary',
    'Engagement',
    'Retirement Party',
    'Religious Ceremony',
    'Reunion'
  ];

  // Welcome note templates
  const getWelcomeNote = (eventType) => {
    const templates = {
      'Wedding': [
        "Join us in celebrating the beautiful union of love and commitment. We are delighted to share our special day with you.",
        "With joy in our hearts, we invite you to witness the beginning of our forever journey together.",
        "Your presence will add to the magic of our wedding celebration as we unite two hearts in love."
      ],
      'Birthday Party': [
        "Come join us for a day filled with laughter, joy, and celebration as we mark another year of wonderful memories.",
        "Let's make this birthday extra special with your presence and create memories to cherish forever.",
        "You're invited to a spectacular celebration of life, love, and happiness!"
      ],
      'Corporate Event': [
        "We cordially invite you to join us for an evening of networking, innovation, and professional excellence.",
        "Your presence will enhance this gathering of industry leaders and visionaries.",
        "Join us for an exclusive corporate gathering where we celebrate success and forge new partnerships."
      ],
      'Baby Shower': [
        "Join us in celebrating the upcoming arrival of our little bundle of joy!",
        "With hearts full of love, we invite you to share in our excitement as we prepare to welcome our newest family member.",
        "Let's shower our little one with love and blessings before their grand arrival!"
      ],
      'Graduation': [
        "Join us in celebrating years of hard work, determination, and success!",
        "Your presence will make our graduation celebration even more memorable.",
        "Let's celebrate this milestone achievement together!"
      ],
      'Anniversary': [
        "Join us in celebrating years of love, laughter, and beautiful memories together.",
        "Your presence will make our anniversary celebration truly special.",
        "Help us commemorate this milestone in our journey of love."
      ],
      'Engagement': [
        "Join us as we celebrate the beginning of our forever journey!",
        "With joy in our hearts, we invite you to witness our promise of love.",
        "Your presence will make our engagement celebration truly memorable."
      ],
      'Retirement Party': [
        "Join us in celebrating years of dedication and the beginning of a new chapter.",
        "Let's toast to years of hard work and the adventures that lie ahead!",
        "Your presence will make this retirement celebration truly special."
      ],
      'Religious Ceremony': [
        "We humbly invite you to join us in this sacred celebration.",
        "Your presence will add to the blessings of this spiritual occasion.",
        "Join us in this meaningful ceremony of faith and tradition."
      ],
      'Reunion': [
        "Let's come together to relive old memories and create new ones!",
        "Join us for a day of reconnecting, reminiscing, and celebrating our bonds.",
        "Your presence will make this reunion truly complete."
      ]
    };

    if (!eventType || !templates[eventType]) return '';
    const notes = templates[eventType];
    return notes[Math.floor(Math.random() * notes.length)];
  };

  // Generate welcome note
  const generateWelcomeNote = () => {
    if (!formData.eventType) {
      toast.warning('Please select an event type first');
      return;
    }
    const note = getWelcomeNote(formData.eventType);
    setFormData(prevState => ({
      ...prevState,
      welcomeNote: note
    }));
    toast.success('Welcome note generated!');
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (file && allowedTypes.includes(file.type)) {
      setFormData(prevState => ({
        ...prevState,
        guestList: file
      }));
    } else {
      toast.error('Please upload a valid Excel or CSV file');
    }
  };

  // Generate unique ID
  const generateUniqueId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}`.toUpperCase();
  };

  // Search Control Component
  const SearchControl = () => {
    const map = useMap();
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const provider = new OpenStreetMapProvider();
    
    const handleSearch = async (e) => {
      const query = e.target.value;
      setSearchValue(query);
      
      if (query.length > 2) {
        const results = await provider.search({ query });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };

    const handleResultClick = (result) => {
      const newPosition = [result.y, result.x];
      map.setView(newPosition, 13);
      setSearchValue(result.label);
      setSearchResults([]);
      // Update parent component's state
      setPosition(newPosition);
      setFormData(prev => ({
        ...prev,
        latitude: result.y,
        longitude: result.x,
        locationName: result.label,
        location: result.label
      }));
    };

    return (
      <div className="leaflet-top leaflet-right" style={{ zIndex: 1000 }}>
        <div className="leaflet-control p-3" style={{ minWidth: '320px' }}>
          <div className={`
            relative transition-all duration-200
            ${isFocused ? 'transform -translate-y-1' : ''}
          `}>
            <div className={`
              relative bg-white rounded-lg shadow-lg
              ${isFocused ? 'ring-2 ring-blue-400 shadow-xl' : 'hover:shadow-xl'}
              transition-all duration-200
            `}>
              <input
                type="text"
                value={searchValue}
                onChange={handleSearch}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder="Search location..."
                className={`
                  w-full p-3 pl-10 rounded-lg
                  bg-white text-gray-700
                  placeholder-gray-400
                  focus:outline-none
                  transition-all duration-200
                `}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className={`
                absolute w-full mt-2 
                bg-white rounded-lg shadow-xl 
                max-h-[200px] overflow-y-auto
                border border-gray-100
                transition-all duration-200
                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
              `}>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className={`
                      p-3 cursor-pointer
                      hover:bg-blue-50 
                      transition-colors duration-150
                      flex items-center gap-2
                      ${index !== searchResults.length - 1 ? 'border-b border-gray-100' : ''}
                    `}
                    onClick={() => handleResultClick(result)}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 text-gray-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {result.label.split(',')[0]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {result.label.split(',').slice(1).join(',')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Map Component
  const MapComponent = () => {
    const map = useMap();
    
    useEffect(() => {
      map.setView(position, 13);
    }, [position]);

    return <SearchControl />;
  };

  // Function to parse file and generate preview
  const generatePreview = async (file) => {
    try {
      if (file.type === 'text/csv') {
        // Handle CSV files
        Papa.parse(file, {
          complete: (results) => {
            setPreviewData({
              headers: results.data[0],
              rows: results.data.slice(1, 11) // Show first 10 rows
            });
          },
          header: false
        });
      } else {
        // Handle Excel files
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        setPreviewData({
          headers: jsonData[0],
          rows: jsonData.slice(1, 11) // Show first 10 rows
        });
      }
      setShowPreview(true);
    } catch (error) {
      toast.error('Error reading file: ' + error.message);
    }
  };

  // Preview Modal Component
  const PreviewModal = ({ onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-4xl max-h-[80vh] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600">
            <h3 className="text-xl font-semibold text-white">Guest List Preview</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 overflow-auto max-h-[calc(80vh-120px)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {previewData.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Showing first 10 rows of the guest list
            </p>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modified File Upload Section
  const FileUploadSection = () => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Upload Guest List
        </label>
        {formData.guestList && (
          <button
            type="button"
            onClick={() => generatePreview(formData.guestList)}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
          >
            <FiEye className="mr-1" />
            Show Preview
          </button>
        )}
      </div>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition-colors duration-200 ease-in-out bg-gray-50">
        <div className="space-y-3 text-center">
          <FiUpload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500" />
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
              <span>Upload a file</span>
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            CSV, Excel files up to 10MB
          </p>
          {formData.guestList && (
            <p className="text-sm text-blue-600 font-medium">
              Selected: {formData.guestList.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Fetch current user on component mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Function to fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const userData = await response.json();
      console.log("userdate =",userData)
      setUserEmail(userData.data.email);
      setFormData(prev => ({
        ...prev,
        vendor: userData.data.email
      }));
    } catch (error) {
      console.error('Error fetching current user:', error);
      toast.error('Error fetching user details');
    }
  };

  // Fetch all guest lists from the database on component mount
  useEffect(() => {
    const fetchGuestLists = async () => {
      try {
        const response = await fetch(SummaryApi.allGuestLists.url, {
          method: SummaryApi.allGuestLists.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('Fetched Data:', data); // Log the fetched data

        // Check if data is in the expected format
        if (data && data.data) {
          const ids = data.data.map(guestList => guestList.uniqueId); // Extract unique IDs
          setUniqueIds(ids); // Set unique IDs state
          setFilteredIds(ids); // Initially, filtered IDs are the same as unique IDs
          setGuestLists(data.data); // Store all guest lists

          // Create a mapping of IDs to colors
          const colorMapping = {};
          ids.forEach((id, index) => {
            colorMapping[id] = colors[index % colors.length]; // Assign colors based on index
          });
          setIdColorMap(colorMapping); // Set the color mapping
        } else {
          console.warn('No data found in the response');
        }
      } catch (error) {
        console.error('Error fetching guest lists:', error);
      }
    };

    fetchGuestLists();
  }, [userEmail]); // Dependency on userEmail to refetch when it changes

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData object
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'guestList') {
          if (formData[key]) {
            data.append(key, formData[key]);
          }
        } else {
          data.append(key, formData[key]);
        }
      });

      // Generate and add unique ID
      const newUniqueId = generateUniqueId();
      data.append('uniqueId', newUniqueId);
      data.append('vendor', userEmail);

      // Make API call using SummaryApi
      const response = await fetch(SummaryApi.createGuestList.url, {
        method: SummaryApi.createGuestList.method,
        credentials: 'include',
        body: data
      });

      // Check if the response is okay
      if (!response.ok) {
        const errorText = await response.text(); // Get the response as text
        console.error('Error response:', errorText); // Log the error response
        throw new Error('Failed to create guest list');
      }

      const result = await response.json();
      setUniqueId(newUniqueId);
      toast.success('Guest list created successfully!');

      // Clear form after successful submission
      setFormData({
        eventName: '',
        eventType: '',
        eventDate: '',
        welcomeNote: '',
        dressCode: '',
        location: '',
        guestList: null,
        latitude: '',
        longitude: '',
        locationName: '',
        vendor: userEmail
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to create guest list');
    } finally {
      setLoading(false);
    }
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await response.json();
    return data.display_name; // Return the address
  };

  // Function to toggle form visibility
  const toggleFormVisibility = () => {
    setIsFormVisible(prev => !prev);
  };

  // Function to handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchId(value);

    // Filter unique IDs based on the search input
    const filtered = uniqueIds.filter(id => id.toLowerCase().includes(value.toLowerCase()));
    setFilteredIds(filtered);
  };

  // Function to handle ID click and show modal
  const handleIdClick = (id) => {
    // Find the selected guest list details from the stored guest lists
    const guestListDetails = guestLists.find(guestList => guestList.uniqueId === id);
    setSelectedGuestList(guestListDetails); // Set the selected guest list details
    setModalVisible(true); // Show the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedGuestList(null); // Clear selected guest list
  };

  // Function to convert image URL to Base64
  const getBase64Image = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching image:', error);
      return null; // Return null if there's an error
    }
  };

  // Function to download data as XLSX
  const downloadExcel = async (guestList) => {
    console.log('Guest List Data:', guestList); // Log the entire guestList object

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Guest List');

    // Add merged event details at the top
    const eventDetails = [
      { Event: 'Event Name', Value: guestList.eventName },
      { Event: 'Event Type', Value: guestList.eventType },
      { Event: 'Event Date', Value: new Date(guestList.eventDate).toLocaleDateString() },
      { Event: 'Welcome Note', Value: guestList.welcomeNote || 'N/A' },
      { Event: 'Dress Code', Value: guestList.dressCode || 'N/A' },
      { Event: 'Location', Value: guestList.location.locationName || 'N/A' },
      { Event: 'Address', Value: guestList.location.address },
      { Event: 'Vendor', Value: guestList.vendor },
      { Event: 'Unique ID', Value: guestList.uniqueId },
      { Event: 'Created At', Value: new Date(guestList.createdAt).toLocaleString() },
      { Event: 'Updated At', Value: new Date(guestList.updatedAt).toLocaleString() },
    ];

    // Add event details to the sheet
    eventDetails.forEach((detail) => {
      sheet.addRow([detail.Event, detail.Value]);
    });

    // Merge cells for the title
    sheet.getCell('A1').value = 'Event Details';
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.mergeCells('A1:B1');

    // Add a blank row for spacing
    sheet.addRow([]);

    // Add guest details heading
    sheet.addRow(['Guest Information']); // Add heading for guest information
    sheet.getCell('A3').font = { bold: true, size: 12 }; // Make the heading bold
    sheet.addRow([]); // Add a blank row for spacing

    // Add guest details header
    sheet.addRow(['Name', 'Email', 'Phone', 'Status', 'Address', 'QR Code']);

    // Set column widths
    sheet.columns = [
      { width: 30 },
      { width: 30 },
      { width: 15 },
      { width: 15 },
      { width: 30 },
      { width: 20 },
    ];

    // Check if guests array is empty
    if (!guestList.guests || guestList.guests.length === 0) {
      console.warn('No guests found in the guest list.');
      return; // Exit if there are no guests
    }

    // Use map to add guest details
    await Promise.all(guestList.guests.map(async (guest) => {
      console.log('Processing Guest:', guest); // Log each guest being processed

      // Explicitly add values to the row
      const row = sheet.addRow([
        guest.name || 'N/A', // Name
        guest.email || 'N/A', // Email
        guest.phone || 'N/A', // Phone
        guest.status || 'N/A', // Status
        guest.additionalInfo?.Address || 'N/A', // Address
        null // Placeholder for QR Code (to be added as an image later)
      ]);

      console.log('Added Row:', row.values); // Log the values added to the row

      // Add QR Code image as Base64
      if (guest.qrCode) {
        const base64Image = await getBase64Image(guest.qrCode);
        if (base64Image) {
          const imgId = workbook.addImage({
            base64: base64Image,
            extension: 'png',
          });
          sheet.addImage(imgId, {
            tl: { col: 5, row: row.number - 1 }, // Positioning the image in the QR Code column
            ext: { width: 50, height: 50 }, // Set the size of the QR code image
          });

          // Adjust the row height to accommodate the QR code
          sheet.getRow(row.number).height = 60; // Adjust height as needed
        } else {
          console.warn(`Could not load QR code for ${guest.name}`);
        }
      }
    }));

    // Generate file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GuestListDetails.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Guest Management
          </h1>
          <p className="text-lg text-gray-600">
            Create and manage your event's guest list
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2">
            <input
              type="text"
              value={searchId}
              onChange={handleSearch}
              placeholder="Enter Unique ID to search..."
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
            />
          </div>
        </div>

        {/* Filtered Unique IDs List in Colorful Containers */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Filtered Unique IDs:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredIds.length > 0 ? (
              filteredIds.map((id) => (
                <div 
                  key={id} 
                  className={`p-4 rounded-lg shadow-md ${idColorMap[id]} h-24 flex items-center justify-center cursor-pointer`} 
                  onClick={() => handleIdClick(id)}
                >
                  <p className="text-center text-gray-800 font-semibold">{id}</p>
                </div>
              ))
            ) : (
              <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center text-gray-700">
                No matching IDs found.
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button for Form */}
        <div className="text-center mb-4">
          <button
            onClick={toggleFormVisibility}
            className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiPlusCircle className="animate-bounce mr-2" />
            Create a New Guest List
          </button>
        </div>

        {/* Main Container */}
        {isFormVisible && (
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm backdrop-filter">
            {/* Container Header */}
            <div className="px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-xl font-semibold text-white">Event Details</h2>
            </div>

            {/* Form Container */}
            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Name and Type in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Name
                    </label>
                    <input
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                      placeholder="Enter event name"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Event Date and Dress Code in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dress Code
                    </label>
                    <textarea
                      name="dressCode"
                      value={formData.dressCode}
                      onChange={handleChange}
                      rows="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out resize-none"
                      placeholder="Specify dress code requirements..."
                    />
                  </div>
                </div>

                {/* Welcome Note */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Welcome Note
                    </label>
                    <button
                      type="button"
                      onClick={generateWelcomeNote}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                    >
                      <FiZap className="mr-1" />
                      Generate Note
                    </button>
                  </div>
                  <textarea
                    name="welcomeNote"
                    value={formData.welcomeNote}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out resize-none"
                    placeholder="Write a warm welcome message for your guests..."
                  />
                </div>

                {/* Location Map */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Location
                  </label>
                  <div className="h-[300px] rounded-xl overflow-hidden border relative mb-4">
                    <MapContainer
                      center={position}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker 
                        position={position}
                        draggable={true}
                        eventHandlers={{
                          dragend: async (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            setPosition([position.lat, position.lng]);
                            
                            // Get the address from the new position
                            const address = await getAddressFromCoordinates(position.lat, position.lng);
                            
                            setFormData(prev => ({
                              ...prev,
                              latitude: position.lat,
                              longitude: position.lng,
                              location: address // Update to show the address instead of lat/lng
                            }));
                          },
                        }}
                      />
                      <MapComponent />
                    </MapContainer>
                  </div>
                  <textarea
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out resize-none"
                    placeholder="Location details will be updated automatically when you select from map..."
                  />
                </div>

                {/* File Upload */}
                <FileUploadSection />

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 text-lg font-medium shadow-lg"
                  >
                    {loading ? 'Creating...' : 'Create Guest List'}
                  </button>
                </div>

                {/* Display Unique ID */}
                {uniqueId && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                    <p className="text-green-800 font-medium text-lg">Unique ID: {uniqueId}</p>
                    <p className="text-sm text-green-600 mt-2">
                      Please save this ID for future reference
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}

        {/* Modal for Guest List Details */}
        {modalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-4xl max-h-[80vh] overflow-hidden transform transition-transform duration-300 scale-100 hover:scale-105">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600">
                <h3 className="text-xl font-semibold text-white">Guest List Details</h3>
                <button onClick={closeModal} className="text-white hover:text-gray-200 transition-colors">
                  <FiXCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-auto max-h-[calc(80vh-120px)]">
                <div className="flex">
                  {/* Event Details Section (up to Dress Code) */}
                  <div className="w-1/2 pr-4">
                    <h4 className="text-lg font-bold">Event Details</h4>
                    <div className="space-y-2">
                      <p className="flex items-center"><FiUser className="mr-2 text-blue-600" /><strong>Event Name:</strong> {selectedGuestList.eventName}</p>
                      <p className="flex items-center"><FiCheckCircle className="mr-2 text-blue-600" /><strong>Event Type:</strong> {selectedGuestList.eventType}</p>
                      <p className="flex items-center"><FiCalendar className="mr-2 text-blue-600" /><strong>Event Date:</strong> {new Date(selectedGuestList.eventDate).toLocaleDateString()}</p>
                      <p className="flex items-center"><FiClipboard className="mr-2 text-blue-600" /><strong>Welcome Note:</strong> {selectedGuestList.welcomeNote || 'N/A'}</p>
                      <p className="flex items-center"><FiTag className="mr-2 text-blue-600" /><strong>Dress Code:</strong> {selectedGuestList.dressCode || 'N/A'}</p>
                      <p className="flex items-center"><strong>Created At:</strong> {new Date(selectedGuestList.createdAt).toLocaleString()}</p>
                      
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="border-l border-gray-300 mx-4"></div>

                  {/* Remaining Details Section */}
                  <div className="w-1/2 pl-4">
                    <h4 className="text-lg font-bold">Additional Details</h4>
                    <div className="space-y-2">
                      <p className="flex items-center"><FiMapPin className="mr-2 text-blue-600" /><strong>Location:</strong> {selectedGuestList.location.locationName || 'N/A'}</p>
                      <p className="flex items-center"><strong>Address:</strong> {selectedGuestList.location.address}</p>
                      <p className="flex items-center"><strong>Coordinates:</strong> {`Lat: ${selectedGuestList.location.coordinates.latitude}, Lon: ${selectedGuestList.location.coordinates.longitude}`}</p>
                      <p className="flex items-center"><strong>Vendor:</strong> {selectedGuestList.vendor}</p>
                      <p className="flex items-center"><strong>Unique ID:</strong> {selectedGuestList.uniqueId}</p>
                      <p className="flex items-center"><strong>Updated At:</strong> {new Date(selectedGuestList.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Full-Width Guest Table */}
                <div className="mt-4">
                  <h4 className="text-lg font-bold">Guests</h4>
                  {selectedGuestList.guests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedGuestList.guests.map((guest, index) => (
                            <tr key={index} className="hover:bg-gray-100 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{guest.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{guest.email || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{guest.phone || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{guest.status}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{guest.additionalInfo?.Address || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <img src={guest.qrCode} alt={`QR Code for ${guest.name}`} className="h-10 w-10 rounded" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No guests found for this event.</p>
                  )}
                </div>

                {/* Download Button */}
                <div className="mt-4 text-right">
                  <button
                    onClick={() => downloadExcel(selectedGuestList)}
                    className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FiDownload className="mr-2" />
                    Download Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestManagement;
