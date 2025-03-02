import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUpload, FiZap, FiEye } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';
import SummaryApi from '../common';

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

        {/* Main Container */}
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

        {/* Preview Modal */}
        {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}
      </div>
    </div>
  );
};

export default GuestManagement;
