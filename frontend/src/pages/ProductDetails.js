import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import SummaryApi from '../common';
import displayINRCurrency from '../helpers/displayCurrency';
import CategroyWiseProductDisplay from '../components/CategoryWiseProductDisplay';
import addToCart from '../helpers/addToCart';
import Context from '../context';
import { FaStar, FaStarHalf } from "react-icons/fa";
import { toast } from 'react-toastify';
import { FiShoppingCart, FiSettings } from 'react-icons/fi';
import { BsCalendarCheck } from 'react-icons/bs';
import { FaStore } from 'react-icons/fa';
import { MdRestaurantMenu } from 'react-icons/md';
import { format } from 'date-fns';
import { FaThumbsUp } from 'react-icons/fa';
import { FaCheckCircle } from 'react-icons/fa';

const ProductDetails = () => {
  const [data, setData] = useState({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    description: "",
    price: "",
  });
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [activeImages, setActiveImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState({ fullStars: 0, hasHalfStar: false }); // New state for rating
  const [showFullDescription, setShowFullDescription] = useState(false);
  const maxLength = 300; // Show first 300 characters initially
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState({});
  const [currentConfiguration, setCurrentConfiguration] = useState(null); // Store configuration here
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [productRating, setProductRating] = useState({ avgRating: 0, totalRatings: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [ratingStats, setRatingStats] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });
  const [allUsers, setAllUsers] = useState([]);

  // Add new state for bakery configuration
  const [bakeryConfig, setBakeryConfig] = useState({});
  const [isBakeryConfigModalOpen, setIsBakeryConfigModalOpen] = useState(false);
  const [currentBakeryConfiguration, setCurrentBakeryConfiguration] = useState(null);
  const [selectedBakeryVariant, setSelectedBakeryVariant] = useState(null);

  // Add state for selected rental variant
  const [selectedRentalVariant, setSelectedRentalVariant] = useState(null);

  const { fetchUserAddToCart } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProductDetails = async () => {
    setLoading(true);
    const response = await fetch(SummaryApi.productDetails.url, {
      method: SummaryApi.productDetails.method,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        productId: params?.id,
      }),
    });
    setLoading(false);
    const dataResponse = await response.json();
    setData(dataResponse?.data);
    setActiveImages(dataResponse?.data?.productImage || []);
    setActiveImageIndex(0);
    
    // Generate a random rating: 2, 3, or 4 full stars
    const randomFullStars = Math.floor(Math.random() * 3) + 2; // Generates 2, 3, or 4

    // Decide whether to include a half star or not (50% chance)
    const includeHalfStar = Math.random() < 0.5; // 50% chance to include half star

    setRating({ fullStars: randomFullStars, hasHalfStar: includeHalfStar });
  };

  const fetchProductRating = async () => {
    try {
      const response = await fetch(SummaryApi.getRating.url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch ratings');

      const data = await response.json();
      if (Array.isArray(data?.data)) {
        const productRatings = data.data.filter(rating => rating.productId === params.id);
        
        // Calculate rating distribution
        const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        productRatings.forEach(rating => {
          stats[Math.floor(rating.rating)]++;
        });
        setRatingStats(stats);

        // Calculate average rating
        const totalRatings = productRatings.length;
        const avgRating = totalRatings > 0 
          ? productRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
          : 0;

        setProductRating({
          avgRating: Math.round(avgRating * 2) / 2,
          totalRatings
        });

        // Set reviews data with all details
        const reviewsWithDetails = productRatings.map(rating => ({
          rating: rating.rating,
          review: rating.review,
          userEmail: rating.userEmail,
          createdAt: rating.createdAt,
          orderId: rating.orderId
        }));

        // Update the data state with reviews
        setData(prevData => ({
          ...prevData,
          reviews: reviewsWithDetails
        }));

        console.log('Reviews data set:', reviewsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    if (params.id) {
      fetchProductRating();
      fetchAllUsers(); // Fetch users data as well
    }
  }, [params]);

  // Initialize selectedDishes with empty arrays for each course
  useEffect(() => {
    if (data?.catering?.courses) {
      const initialSelection = {};
      data.catering.courses.forEach(course => {
        initialSelection[course.courseType] = [];
      });
      setSelectedDishes(initialSelection);
    }
  }, [data?.catering?.courses]);

  // Update useEffect to handle initial variant selection
  useEffect(() => {
    if (data?.category?.toLowerCase() === "rent" && data?.rentalVariants?.length > 0) {
      const initialVariant = data.rentalVariants[0];
      setSelectedRentalVariant(initialVariant);
      // Set initial variant images if available
      if (initialVariant.images && initialVariant.images.length > 0) {
        setActiveImages(initialVariant.images);
        setActiveImageIndex(0);
      }
      // Set initial variant price
      setData(prevData => ({
        ...prevData,
        price: initialVariant.price
      }));
    }
  }, [data?.category, data?.rentalVariants]);

  // Set initial bakery variant when data loads
  useEffect(() => {
    if (data?.category?.toLowerCase() === "bakers" && data?.bakeryVariants?.length > 0) {
      setSelectedBakeryVariant(data.bakeryVariants[0]);
      setActiveImages(data.bakeryVariants[0].images || []);
    }
  }, [data]);

  const handleConfigurationSave = () => {
    const hasEmptySelection = Object.values(selectedDishes).some(dishes => 
      !Array.isArray(dishes) || dishes.length === 0
    );
    
    if (hasEmptySelection) {
      toast.error('Please select at least one dish from each course');
      return;
    }
    
    // Save configuration to state
    setCurrentConfiguration(selectedDishes);
    console.log('Configuration Saved:', selectedDishes); // Log when saving
    toast.success('Configuration saved!');
    setIsConfigModalOpen(false);
  };

  const addToCartWithConfig = async (productId, quantity, configuration) => {
    try {
      // Log the data being sent
      console.log('Sending to backend:', {
        productId,
        quantity,
        configuration
      });

      const response = await fetch(SummaryApi.addToCartWithConfig.url, {
        method: SummaryApi.addToCartWithConfig.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          quantity,
          configuration
        })
      });

      const data = await response.json();
      console.log('Backend Response:', data); // Log the response

      if (data.success) {
        toast.success(data.message);
        fetchUserAddToCart();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Add to Cart Error:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const addToCartWithVariant = async (e, productId) => {
    e.stopPropagation();
    try {
      if (!selectedVariant) {
        toast.error('Please select a variant first');
        return;
      }

      // Log the data being sent
      console.log('Sending to backend:', {
        productId,
        quantity,
        variantId: selectedVariant._id,
        variantName: selectedVariant.itemName,
        variantPrice: selectedVariant.price
      });

      const response = await fetch(SummaryApi.addToCartWithVariant.url, {
        method: SummaryApi.addToCartWithVariant.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          quantity,
          variantId: selectedVariant._id,
          variantName: selectedVariant.itemName,
          variantPrice: selectedVariant.price
        })
      });

      const responseData = await response.json();
      console.log('Backend Response:', responseData);

      if (responseData.success) {
        toast.success(responseData.message);
        fetchUserAddToCart();
      } else {
        toast.error(responseData.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to Cart Error:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Handle bakery item quantity change with max limit
  const handleBakeryQuantityChange = (itemId, quantity) => {
    const item = data?.bakeryVariants?.find(variant => variant._id === itemId);
    const maxQuantity = item?.servingCapacity || 10;
    
    // Ensure quantity is within bounds (0 to maxQuantity)
    const validQuantity = Math.min(maxQuantity, Math.max(0, parseInt(quantity) || 0));
    
    setBakeryConfig(prev => ({
      ...prev,
      [itemId]: validQuantity
    }));
  };

  // Save bakery configuration
  const handleBakeryConfigurationSave = () => {
    const hasItems = Object.values(bakeryConfig).some(quantity => quantity > 0);
    
    if (!hasItems) {
      toast.error('Please select at least one bakery item');
      return;
    }
    
    // Save configuration to state
    setCurrentBakeryConfiguration(bakeryConfig);
    console.log('Bakery Configuration Saved:', bakeryConfig);
    toast.success('Bakery configuration saved!');
    setIsBakeryConfigModalOpen(false);
  };

  // Add to cart with bakery configuration
  const addToCartWithBakeryConfig = async (productId, quantity, configuration) => {
    try {
      console.log('Sending to backend:', {
        productId,
        quantity,
        configuration
      });

      const response = await fetch(SummaryApi.addToCartWithConfig.url, {
        method: SummaryApi.addToCartWithConfig.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          quantity,
          configuration
        })
      });

      const data = await response.json();
      console.log('Backend Response:', data);

      if (data.success) {
        toast.success(data.message);
        fetchUserAddToCart();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Add to Cart Error:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Modified handleRentalVariantSelect function
  const handleRentalVariantSelect = (variant) => {
    setSelectedRentalVariant(variant);
    // Update active images if variant has images
    if (variant.images && variant.images.length > 0) {
      setActiveImages(variant.images);
      setActiveImageIndex(0);
    } else {
      // Fallback to product's default images if variant has no images
      setActiveImages(data.productImage || []);
      setActiveImageIndex(0);
    }
    // Update the main price in the data state
    setData(prevData => ({
      ...prevData,
      price: variant.price
    }));
  };

  // Modified handleAddToCart function
  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      if (data.category.toLowerCase() === 'bakers') {
        // Handle adding bakery items with configuration
        if (!currentBakeryConfiguration) {
          toast.error('Please configure your bakery items before adding to cart');
          return;
        }

        if (!selectedBakeryVariant) {
          toast.error('Please select a bakery variant');
          return;
        }

        const response = await fetch(SummaryApi.addToCartWithBakeryConfig.url, {
          method: SummaryApi.addToCartWithBakeryConfig.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: params.id,
            selectedVariant: {
              ...selectedBakeryVariant,
              servingCapacity: selectedBakeryVariant.servingCapacity // Include serving capacity
            },
            configuration: currentBakeryConfiguration
          })
        });

        const responseData = await response.json();
        if (responseData.success) {
          toast.success('Bakery items added to cart successfully');
          fetchUserAddToCart();
        } else {
          toast.error(responseData.message || 'Failed to add bakery items to cart');
        }
      } else if (data.category.toLowerCase() === 'catering') {
        // Handle catering products with configuration
        if (!currentConfiguration) {
          toast.error('Please configure your catering preferences before adding to cart');
          return;
        }
        
        // Use the dedicated function for catering configuration
        await addToCartWithConfig(params.id, quantity, currentConfiguration);
      } else if (data.category.toLowerCase() === 'rent') {
        if (!selectedRentalVariant) {
          toast.error('Please select a rental variant');
          return;
        }

        const response = await fetch(SummaryApi.addToCartWithVariant.url, {
          method: SummaryApi.addToCartWithVariant.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: params.id,
            quantity: quantity,
            rentalVariant: {
              variantId: selectedRentalVariant._id,
              variantName: selectedRentalVariant.itemName,
              variantPrice: selectedRentalVariant.price,
              duration: selectedRentalVariant.duration || 1,
              images: selectedRentalVariant.images || []
            }
          })
        });

        const responseData = await response.json();
        if (responseData.success) {
          toast.success('Product added to cart successfully');
          fetchUserAddToCart();
        } else {
          toast.error(responseData.message || 'Failed to add product to cart');
        }
      } else {
        // Regular products use the existing addToCart helper
        const success = await addToCart(params.id, quantity, fetchUserAddToCart, e); // Pass event here
        if (success) {
          toast.success('Product added to cart successfully');
        }
      }
    } catch (error) {
      console.error('Add to Cart Error:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  // Optional: Log whenever configuration changes
  useEffect(() => {
    if (currentConfiguration) {
      console.log('Current Configuration State:', currentConfiguration);
    }
  }, [currentConfiguration]);

  const handleImageHover = (index) => {
    setActiveImageIndex(index);
  };

  // Function to handle description display
  const renderDescription = (description) => {
    if (!description) return null;

    const lines = description.split('\n');
    const fullText = lines.join('\n');
    
    if (fullText.length <= maxLength || showFullDescription) {
      // Show full description
      return (
        <div className='text-black dark:text-white space-y-2'>
          {lines.map((line, index) => (
            line.trim() && (
              <p key={index} className={`${line.startsWith('•') ? 'pl-4' : ''}`}>
                {line}
              </p>
            )
          ))}
        </div>
      );
    } else {
      // Show truncated description
      const truncatedText = fullText.slice(0, maxLength);
      const lastSpaceIndex = truncatedText.lastIndexOf(' ');
      const displayText = truncatedText.slice(0, lastSpaceIndex);
      
      return (
        <div className='text-black dark:text-white'>
          <div className='space-y-2'>
            {displayText.split('\n').map((line, index) => (
              line.trim() && (
                <p key={index} className={`${line.startsWith('•') ? 'pl-4' : ''}`}>
                  {line}
                </p>
              )
            ))}
          </div>
          <span className='text-gray-500'>...</span>
        </div>
      );
    }
  };

  const handleConfigureClick = () => {
    setIsConfigModalOpen(true);
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setActiveImages(variant.images || []);
    setActiveImageIndex(0); // Reset to first image when variant changes
  };

  // Handle bakery variant selection
  const handleBakeryVariantSelect = (variant) => {
    setSelectedBakeryVariant(variant);
    setActiveImages(variant.images || []);
    setActiveImageIndex(0);
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          className={`w-4 h-4 ${
            index < rating
              ? 'text-yellow-400 drop-shadow-sm filter-none transition-colors duration-150'
              : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMagnifierPosition({ x, y });
  };

  const renderReviewSection = () => {
    // Helper function to get user details from allUsers with proper name formatting
    const getUserDetails = (userEmail) => {
      if (!userEmail) return {
        name: 'Anonymous User',
        profilePic: null,
        initial: 'A'
      };

      const user = allUsers.find(user => user.email === userEmail);
      
      // Format name properly
      const formatName = (user) => {
        if (!user) return userEmail;
        
        // If user has a name field, use it directly
        if (user?.name) {
          return user.name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
        
        // Fallback to email if no name is found
        return userEmail;
      };

      // Safe access to user data
      const userName = formatName(user);
      const initial = userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase();

      return {
        name: userName,
        profilePic: user?.profilePic || null,
        initial: initial
      };
    };

    console.log('All Users:', allUsers); // Debug log
    console.log('Reviews Data:', data?.reviews); // Debug log

    return (
      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Ratings & Reviews</h2>
        
        {/* Rating Summary */}
        <div className="flex items-center gap-8 mb-8 p-6 bg-gray-50 rounded-xl shadow-sm">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {productRating.avgRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 justify-center mb-1">
              {renderStars(productRating.avgRating)}
            </div>
            <p className="text-sm text-gray-600">
              {productRating.totalRatings} {productRating.totalRatings === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600 w-8">{star} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${(ratingStats[star] / productRating.totalRatings) * 100 || 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-10">{ratingStats[star] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-8">
          {data?.reviews?.map((review, index) => {
            const userDetails = getUserDetails(review.userEmail);
            
            return (
              <div key={index} className="flex gap-6 pb-8 border-b border-gray-100 last:border-0">
                {/* User Profile Section */}
                <div className="flex-shrink-0 w-12">
                  {userDetails.profilePic ? (
                    <img 
                      src={userDetails.profilePic} 
                      alt={userDetails.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                      <span className="text-blue-600 font-semibold text-lg">
                        {userDetails.initial}
                      </span>
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {userDetails.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <FaCheckCircle className="w-3.5 h-3.5 text-green-500" />
                          Verified Purchase
                        </span>
                        <span>•</span>
                        <span>{format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>

                  {/* Review Text */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {review.review}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Reviews Message */}
        {(!data?.reviews || data.reviews.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-400 mt-2">Be the first to review this product</p>
          </div>
        )}
      </div>
    );
  };

  // Add useEffect to fetch users when component mounts
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const fetchData = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        credentials: 'include'
      });

      const dataResponse = await fetchData.json();

      if (dataResponse.success) {
        setAllUsers(dataResponse.data);
      }

      if (dataResponse.error) {
        toast.error(dataResponse.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch user details');
    }
  };

  // Get the current price based on selected variant or default price
  const getCurrentPrice = () => {
    if (data?.category?.toLowerCase() === "bakers" && selectedBakeryVariant) {
      return selectedBakeryVariant.price;
    }
    return data.price;
  };

  // Modified renderRentalVariants function
  const renderRentalVariants = () => {
    if (data.category?.toLowerCase() === "rent" && data.rentalVariants?.length > 0) {
      return (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Available Variants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.rentalVariants.map((variant) => (
              <div
                key={variant._id}
                onClick={() => handleRentalVariantSelect(variant)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-300
                  ${selectedRentalVariant?._id === variant._id 
                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{variant.itemName}</h4>
                    <p className="text-sm text-gray-600">Duration: {variant.duration} days</p>
                    <p className="text-lg font-semibold text-green-600 mt-1">
                      {displayINRCurrency(variant.price)}
                      <span className="text-sm text-gray-500 ml-1">/day</span>
                    </p>
                    {variant.description && (
                      <p className="text-sm text-gray-600 mt-1">{variant.description}</p>
                    )}
                  </div>
                  {variant.images?.[0] && (
                    <div className="ml-4">
                      <img 
                        src={variant.images[0]} 
                        alt={variant.itemName}
                        className="w-20 h-20 object-cover rounded-md shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-6'>
            {/* Left: Image Gallery Section */}
            <div className='space-y-4'>
              {/* Main Image Display - Fixed size */}
              <div className='relative'>
                {/* Main Image Container */}
                <div 
                  className='w-[500px] h-[500px] rounded-2xl overflow-hidden bg-gray-50 relative cursor-crosshair'
                  onMouseEnter={() => setShowMagnifier(true)}
                  onMouseLeave={() => setShowMagnifier(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={activeImages[activeImageIndex]}
                    className='w-full h-full object-contain p-4'
                    alt="Active product"
                  />
                </div>

                {/* Magnified Preview */}
                {showMagnifier && (
                  <div 
                    className="absolute top-0 -right-[520px] w-[500px] h-[500px] 
                      border-2 border-gray-200 rounded-2xl overflow-hidden bg-white 
                      shadow-xl pointer-events-none"
                  >
                    <div
                      style={{
                        backgroundImage: `url(${activeImages[activeImageIndex]})`,
                        backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '250%',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Thumbnail Images - Fixed size */}
              <div className='flex gap-3 overflow-x-auto pb-2 px-1'>
                {!loading && activeImages.map((imgURL, index) => (
                  <button
                    key={index}
                    onMouseEnter={() => handleImageHover(index)}
                    className={`flex-none w-[80px] h-[80px] rounded-lg overflow-hidden 
                      ${activeImageIndex === index 
                        ? 'ring-2 ring-red-600 ring-offset-2' 
                        : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                      } transition-all duration-200`}
                  >
                    <img
                      src={imgURL}
                      className='w-full h-full object-contain p-2'
                      alt={`Thumbnail ${index}`}
                    />
                  </button>
                ))}
              </div>

              {/* Product Highlights Section */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {/* Delivery Info */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Fast Delivery</h4>
                      <p className="text-sm text-gray-600">on the deliver date</p>
                    </div>
                  </div>
                </div>

                {/* Quality Guarantee */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Quality Assured</h4>
                      <p className="text-sm text-gray-600">100% Guarantee</p>
                    </div>
                  </div>
                </div>

                {/* Customer Support */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-100">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">24/7 Support</h4>
                      <p className="text-sm text-gray-600">Always Available</p>
                    </div>
                  </div>
                </div>

                {/* Secure Payment */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-100">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Secure Payment</h4>
                      <p className="text-sm text-gray-600">100% Safe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Details */}
            <div className='flex flex-col'>
              {/* Brand Link with Store Icon */}
              <Link 
                to={`/vendor/${data?.brandName}`} 
                className='inline-flex items-center px-3 py-1.5 rounded-full 
                  bg-red-50 hover:bg-red-100 transition-colors duration-200
                  border border-red-100 hover:border-red-200 group w-fit mb-3'
              >
                <FaStore className="w-4 h-4 text-red-600 mr-2" />
                <span className='text-red-600 font-medium text-sm group-hover:text-red-700'>
                  {data?.brandName}
                </span>
                <svg className='w-4 h-4 ml-1.5 text-red-500 group-hover:translate-x-0.5 transition-transform' 
                  fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </Link>

              {/* Product Name and Category */}
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>{data?.productName}</h2>
              <div className="flex items-center gap-2 mb-4">
                {renderStars(productRating.avgRating)}
                <span className="text-sm text-gray-600">
                  ({productRating.totalRatings} {productRating.totalRatings === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <p className='capitalize text-gray-500 mb-4'>{data?.category}</p>

              {/* Rental Variants Section */}
              {renderRentalVariants()}

              {/* Price Section with Available Items */}
              <div className="space-y-6">
                {/* Main Price */}
                <div className="flex items-baseline gap-4">
                  <h2 className="text-3xl font-bold text-gray-900">
                    ₹{getCurrentPrice()}
                  </h2>
                  {data?.category?.toLowerCase() === "bakers" && (
                    <span className="text-sm text-gray-500">
                      Price varies by selection
                    </span>
                  )}
                </div>

                {/* Available Items Section */}
                {data?.category?.toLowerCase() === "bakers" && data?.bakeryVariants && (
                  <div className="border-t border-b py-6">
                    <h3 className="text-lg font-semibold mb-4">Available Items</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.bakeryVariants.map((variant, index) => (
                        <div
                          key={index}
                          onClick={() => handleBakeryVariantSelect(variant)}
                          className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 
                            ${selectedBakeryVariant?._id === variant._id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-300'}`}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={variant.images[0]}
                              alt={variant.itemName}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">{variant.itemName}</h4>
                              <p className="text-sm text-gray-600">Serves: {variant.servingCapacity}</p>
                              <p className="text-sm font-semibold text-green-600 mt-1">
                                ₹{variant.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Configuration Buttons */}
                    <div className="flex flex-wrap gap-4 mt-6">
                      <button
                        onClick={() => setIsBakeryConfigModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                          hover:bg-blue-700 transition-colors"
                      >
                        <FiSettings className="w-5 h-5" />
                        Configure Order
                      </button>

                      {currentBakeryConfiguration && (
                        <button
                          onClick={() => setIsBakeryConfigModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 
                            rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <FaCheckCircle className="w-5 h-5" />
                          Edit Configuration
                        </button>
                      )}
                    </div>

                    {/* Configuration Status - Improved Preview */}
                    {currentBakeryConfiguration && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-600 mb-3">
                          <FaCheckCircle className="w-5 h-5" />
                          <span className="font-medium">Configuration Saved</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(currentBakeryConfiguration).map(([itemId, quantity]) => {
                            const item = data.bakeryVariants.find(v => v._id === itemId);
                            if (item && quantity > 0) {
                              return (
                                <div key={itemId} className="flex items-center gap-3 bg-white p-2 rounded-md shadow-sm">
                                  <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                                    <img 
                                      src={item.images?.[0] || ''} 
                                      alt={item.itemName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-800">{item.itemName}</div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                      <span>Qty: {quantity}</span>
                                      <span>₹{item.price * quantity}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-green-200 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                          <span className="font-bold text-green-700">
                            ₹{Object.entries(currentBakeryConfiguration).reduce((total, [itemId, quantity]) => {
                              const item = data?.bakeryVariants?.find(variant => variant._id === itemId);
                              return total + (item ? item.price * quantity : 0);
                            }, 0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Input - Hide for bakers category */}
              {data?.category?.toLowerCase() !== "bakers" && (
                <div className="mt-8 mb-6">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                      <button
                        onClick={(e) => quantity > 1 && setQuantity(quantity - 1)}
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 
                          transition-colors duration-200 focus:outline-none focus:ring-2 
                          focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        <span className="text-gray-600 text-lg font-medium">−</span>
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-3 py-2 text-center border-none focus:outline-none 
                          focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-gray-700"
                      />
                      <button
                        onClick={(e) => setQuantity(quantity + 1)}
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border-l border-gray-300 
                          transition-colors duration-200 focus:outline-none focus:ring-2 
                          focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        <span className="text-gray-600 text-lg font-medium">+</span>
                      </button>
                    </div>
                    
                    {/* Total Price Display */}
                    <div className="text-gray-600">
                      Total: <span className="font-semibold text-gray-900">
                        {displayINRCurrency(data.price * quantity)}
                      </span>
                      {data.category?.toLowerCase() === "rent" && (
                        <span className="text-sm text-gray-500 ml-1">/day</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons with Icons */}
              <div className='grid grid-cols-1 gap-4 mb-8'>
                {data?.category === "catering" && (
                  <button
                    onClick={handleConfigureClick}
                    className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white 
                      px-6 py-3.5 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 
                      transition-all duration-200 flex items-center justify-center gap-3 
                      shadow-sm hover:shadow-md'
                  >
                    <MdRestaurantMenu className="w-5 h-5" />
                    Configure Your Platter
                  </button>
                )}
                
                <div className='grid grid-cols-2 gap-4'>
                  <button
                    onClick={handleAddToCart}
                    disabled={data?.category === "rent" && !selectedRentalVariant}
                    className='w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl 
                      font-medium hover:bg-blue-700 transition-all duration-200 
                      flex items-center justify-center gap-3 shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <BsCalendarCheck className="w-5 h-5" />
                    Book Now
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={data?.category === "rent" && !selectedRentalVariant}
                    className='w-full bg-green-600 text-white px-6 py-3.5 rounded-xl 
                      font-medium hover:bg-green-700 transition-all duration-200 
                      flex items-center justify-center gap-3 shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    Add To Cart
                  </button>
                </div>
              </div>

              {/* Description Section */}
              <div className='border-t border-gray-100 pt-6'>
                <div>
                  <p className='text-slate-600 font-medium my-1 dark:text-white'>Description:</p>
                  {renderDescription(data?.description)}
                  
                  {/* Show More/Less Button */}
                  {data?.description && data.description.length > maxLength && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className='text-red-600 hover:text-red-700 font-medium mt-2 flex items-center gap-1'
                    >
                      {showFullDescription ? 'Show Less' : 'Show More'}
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${showFullDescription ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Single Rating & Review Section */}
        {renderReviewSection()}

        {/* Catering Configuration Modal */}
        {isConfigModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{data?.productName}</h2>
                  <p className="text-gray-600">Configure your catering preferences</p>
                </div>
                <button 
                  onClick={() => setIsConfigModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Catering Content */}
              <div className="mt-6">
                {/* Course Type Header */}
                <div className="text-center mb-8">
                  <span className="bg-blue-100 text-blue-800 text-xl font-semibold px-6 py-2 rounded-full">
                    {data?.catering?.courseType} Course Meal
                  </span>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data?.catering?.courses?.map((course, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                      {/* Course Header */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {course.courseName}
                        </h3>
                      </div>

                      {/* Dropdown with Radio Buttons and Scrollbar */}
                      <details className="group">
                        <summary className="flex justify-between items-center p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100">
                          <span className="font-medium text-gray-700">Select {course.courseName}</span>
                          <svg 
                            className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="mt-2 p-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          <div className="space-y-2">
                            {course.dishes.map((dish, dishIndex) => (
                              <label 
                                key={dishIndex}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDishes[course.courseType]?.includes(dish)}
                                  onChange={(e) => {
                                    setSelectedDishes(prev => ({
                                      ...prev,
                                      [course.courseType]: e.target.checked
                                        ? [...(prev[course.courseType] || []), dish]
                                        : prev[course.courseType].filter(d => d !== dish)
                                    }));
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">{dish}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer with Selected Items */}
              <div className="mt-8 border-t pt-4">
                {/* Show Selected Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Your Selection:</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedDishes).map(([courseType, dishes]) => {
                      // Define colors based on course type
                      let colorClasses = {
                        horsOeuvre: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
                        mainCourse: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
                        dessert: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
                        starter: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
                        soup: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
                        salad: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
                        beverage: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200"
                      }[courseType] || "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";

                      return (
                        <div key={courseType}>
                          <span className="font-medium text-gray-700">{courseType}:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Array.isArray(dishes) && dishes.length > 0 ? (
                              dishes.map((dish, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                                    border transition-colors ${colorClasses}`}
                                >
                                  {dish}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500 italic">
                                No dishes selected
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfigurationSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Bakery Configuration Modal */}
        {isBakeryConfigModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">Configure Your Bakery Order</h3>
                <button 
                  onClick={() => setIsBakeryConfigModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.bakeryVariants?.map((item) => (
                  <div key={item._id} className="flex flex-col border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Item Image */}
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={item.images?.[0] || ''} 
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Item Details */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h4 className="font-medium text-lg">{item.itemName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Serves: {item.servingCapacity}
                        </span>
                        <span className="font-medium text-green-600">₹{item.price}</span>
                      </div>
                      
                      {/* Description if available */}
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                      )}
                      
                      {/* Quantity Selector */}
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Quantity:</label>
                        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                          <button
                            onClick={() => handleBakeryQuantityChange(item._id, (bakeryConfig[item._id] || 0) - 1)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={item.servingCapacity}
                            value={bakeryConfig[item._id] || 0}
                            onChange={(e) => handleBakeryQuantityChange(item._id, e.target.value)}
                            className="w-14 p-1 text-center border-x border-gray-300"
                          />
                          <button
                            onClick={() => handleBakeryQuantityChange(item._id, (bakeryConfig[item._id] || 0) + 1)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Max Capacity Warning */}
                      {(bakeryConfig[item._id] || 0) >= item.servingCapacity && (
                        <p className="text-xs text-amber-600 mt-1 text-right">
                          Max capacity reached
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="font-medium text-lg mb-4">Order Summary</h4>
                
                {Object.entries(bakeryConfig).some(([_, qty]) => qty > 0) ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-4">
                      {Object.entries(bakeryConfig).map(([itemId, quantity]) => {
                        const item = data?.bakeryVariants?.find(variant => variant._id === itemId);
                        if (item && quantity > 0) {
                          return (
                            <div key={itemId} className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-md overflow-hidden bg-white border">
                                <img 
                                  src={item.images?.[0] || ''} 
                                  alt={item.itemName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium">{item.itemName}</h5>
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>Quantity: {quantity}</span>
                                  <span>₹{item.price * quantity}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    {/* Total Price */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-green-600">
                        ₹{Object.entries(bakeryConfig).reduce((total, [itemId, quantity]) => {
                          const item = data?.bakeryVariants?.find(variant => variant._id === itemId);
                          return total + (item ? item.price * quantity : 0);
                        }, 0)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No items selected yet</p>
                    <p className="text-sm text-gray-400 mt-1">Select quantities for the items you want to order</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsBakeryConfigModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBakeryConfigurationSave}
                  disabled={!Object.values(bakeryConfig).some(qty => qty > 0)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Products Section */}
        {data.category && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <CategroyWiseProductDisplay category={data?.category} heading={"Recommended Products"} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;