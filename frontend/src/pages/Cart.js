import React, { useContext, useEffect, useState } from "react";
import SummaryApi from "../common";
import Context from "../context";
import displayINRCurrency from "../helpers/displayCurrency";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal } from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal';

const Cart = () => {
  const [data, setData] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Flipkart");
  const [deliveryDate, setDeliveryDate] = useState("");
  const context = useContext(Context);
  const navigate = useNavigate();
  const loadingCart = new Array(4).fill(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    occasion: '',
    theme: '',
    keywords: '',
    eventDate: '',
    couplePhoto: null // for weddings only
  });
  const [showPosterModal, setShowPosterModal] = useState(false);
  
  const [posterDetails, setPosterDetails] = useState({
    occasion: '',
    theme: '',
    keywords: '',
    eventDate: '',
    couplePhoto: null // for weddings only
  });

  const [showConfigDetails, setShowConfigDetails] = useState({});
  const [rentalDetails, setRentalDetails] = useState({});
  const [cateringDetails, setCateringDetails] = useState({});
  const [showCateringModal, setShowCateringModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [selectedMenuItems, setSelectedMenuItems] = useState({});
  const [rentalDates, setRentalDates] = useState({});
  const [expandedConfigs, setExpandedConfigs] = useState({});

  // Array of colors for different courses
  const courseColors = {
    'Appetizer': 'bg-pink-100 text-pink-800',
    'Main Course': 'bg-blue-100 text-blue-800',
    'Dessert': 'bg-purple-100 text-purple-800',
    'Starter': 'bg-green-100 text-green-800',
    'Soup': 'bg-yellow-100 text-yellow-800',
    'Salad': 'bg-emerald-100 text-emerald-800',
    'Beverage': 'bg-orange-100 text-orange-800'
  };

  const getMinDeliveryDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 2); // Add 2 days to today
    return today.toISOString().split('T')[0];
  };

  const isDateValid = (selectedDate) => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2);
    
    const selected = new Date(selectedDate);
    // Reset time part for accurate date comparison
    selected.setHours(0, 0, 0, 0);
    minDate.setHours(0, 0, 0, 0);
    
    return selected >= minDate;
  };

  const handleDeliveryDateChange = (e) => {
    const selectedDate = e.target.value;
    if (isDateValid(selectedDate)) {
      setDeliveryDate(selectedDate);
    } else {
      // If invalid date selected, set to minimum allowed date
      setDeliveryDate(getMinDeliveryDate());
      toast.error('Please select a date at least 2 days from today');
    }
  };

  const fetchUserDetails = async () => {
    const userDetailsResponse = await fetch(SummaryApi.current_user.url, {
      method: SummaryApi.current_user.method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const userDetailsData = await userDetailsResponse.json();
    if (userDetailsData.success) {
      setUserDetails(userDetailsData.data);
      console.log("User Details:", userDetailsData.data);
    }
  };

  const fetchData = async () => {
    const response = await fetch(SummaryApi.addToCartProductView.url, {
      method: SummaryApi.addToCartProductView.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
    });

    const responseData = await response.json();
    if (responseData.success) {
      setData(responseData.data);
      console.log("Cart Data:", {
        fullData: responseData.data,
        items: responseData.data.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          configuration: item.configuration,
          price: item.productId?.price
        }))
      });
    }
  };

  const handleLoading = async () => {
    await fetchData();
    await fetchUserDetails();
  };

  useEffect(() => {
    setLoading(true);
    handleLoading();
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log("Current Cart State:", data);
  }, [data]);

  useEffect(() => {
    console.log("Cart Data Structure:", {
      fullData: data,
      items: data.map(item => ({
        productId: item.productId,
        configuration: item.configuration,
        catering: item.productId?.catering,
        selectedItems: item.selectedItems
      }))
    });
  }, [data]);

  const increaseQty = async (id, qty) => {
    const response = await fetch(SummaryApi.updateCartProduct.url, {
      method: SummaryApi.updateCartProduct.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        _id: id,
        quantity: parseInt(qty) + 1,
      }),
    });

    const responseData = await response.json();
    if (responseData.success) {
      fetchData();
    }
  };

  const decraseQty = async (id, qty) => {
    if (qty >= 2) {
      const response = await fetch(SummaryApi.updateCartProduct.url, {
        method: SummaryApi.updateCartProduct.method,
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          _id: id,
          quantity: qty - 1,
        }),
      });

      const responseData = await response.json();
      if (responseData.success) {
        fetchData();
      }
    }
  };

  const deleteCartProduct = async (id) => {
    const response = await fetch(SummaryApi.deleteCartProduct.url, {
      method: SummaryApi.deleteCartProduct.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        _id: id,
      }),
    });

    const responseData = await response.json();
    if (responseData.success) {
      fetchData();
      context.fetchUserAddToCart();
    }
  };

  const totalQty = data.reduce((previousValue, currentValue) => previousValue + currentValue.quantity,0);
  const totalPrice = data.reduce((prev, curr) => {
    const itemPrice = curr?.productId?.category.toLowerCase() === 'rent' && curr?.rentalVariant
      ? curr.rentalVariant.variantPrice
      : curr?.productId?.price;
    return prev + (curr.quantity * itemPrice);
  }, 0);

  const shouldApplyDeliveryFee =totalPrice > 5000

  const discount = totalPrice * 0.03; // 3% discount
  const deliveryFee = shouldApplyDeliveryFee ? totalPrice * 0.05 : 0;
  const finalAmount = totalPrice + deliveryFee - discount; // Total after discount
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  const handlePayment = async () => {
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      // Fetch current user details to get the email
      const userDetailsResponse = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const userResponse = await userDetailsResponse.json();
      console.log(userResponse); // Log to check structure

      if (!userResponse.success) {
        toast.error("Failed to fetch user details. Please try again.");
        return;
      }

      const userEmail = userResponse.data.email; // Extract the current user's email
      const phone = userResponse.data.phoneNumber;
      // Fetch order details with email and status filter
      const response = await fetch(SummaryApi.orderDetails.url, {
        method: SummaryApi.orderDetails.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const orderDetailsResponse = await response.json();
      console.log("orsers details",orderDetailsResponse); // Log response to check structure

      if (!orderDetailsResponse.success) {
        toast.error("Failed to fetch order details. Please try again.");
        return;
      }

      // Filter the orders based on user email and status
      const pendingOrders = orderDetailsResponse.data.filter(
        (order) => order.userEmail === userEmail && order.status === "Pending"
      );

      if (pendingOrders.length === 0) {
        toast.error("No pending orders found for this user.");
        return;
      }

      const orderDetails = pendingOrders[0]; // Assuming you want the first pending order
      console.log(orderDetails);
      const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY;
      const razorpayKeySecret = process.env.REACT_APP_RAZORPAY_KEY_SECRET;
      //    console.log(razorpayKey)
      const options = {
        key: razorpayKey,
        key_secret: razorpayKeySecret, // Replace with your Razorpay key
        amount: parseInt(finalAmount * 100), // Amount in smallest currency unit
        currency: "INR",
        name: "Nexus Payment Gateway",
        description: "Thank you for shopping with us.",
        handler: async function (response) {
          try {
            const paymentResponse = await fetch(
              SummaryApi.updateOrderWithPayment.url,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  paymentId: response.razorpay_payment_id, // Send only paymentId
                  orderDetails: {
                    orderId: orderDetails._id, // Include orderId for reference
                  },
                }),
              }
            );

            const paymentData = await paymentResponse.json();
            console.log(paymentData);
            if (paymentData.success) {
              toast.success("Huray! Payment successful... ");

              // Clear the cart after successful payment
              const clearCartResponse = await fetch(SummaryApi.clear_cart.url, {
                method: "DELETE", // Assuming you're using DELETE to clear the cart
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              const clearCartData = await clearCartResponse.json();
              if (clearCartData.success) {
                context.fetchUserAddToCart(); // Refresh cart context
                navigate("/payment-success"); // Redirect to success page
              } else {
                alert("Failed to clear the cart. Please contact support.");
              }
            } else {
              alert(
                "Payment was successful, but updating the order failed. Please contact support."
              );
            }
          } catch (error) {
            console.error("Error updating the order after payment:", error);
            alert(
              "An error occurred while processing your order. Please try again."
            );
          }
        },
        prefill: {
          name: orderDetails.userName,
          email: orderDetails.userEmail,
          contact: phone || "9999999999",
        },
        theme: {
          color: "#ffffff",
        },
        modal: {
          onClose: () => {
            alert("Payment process closed.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert(
        "An error occurred while fetching order details. Please try again."
      );
    }
  };

  // Function to handle rental variant selection
  const handleRentalVariantSelect = (productId, variant, duration, startDate, endDate) => {
    setRentalDetails(prev => ({
      ...prev,
      [productId]: {
        variantId: variant._id,
        variantName: variant.name,
        variantPrice: variant.price,
        duration,
        startDate,
        endDate
      }
    }));
  };

  // Function to handle catering details
  const handleCateringDetails = (productId, selectedCourses) => {
    setCateringDetails(prev => ({
      ...prev,
      [productId]: {
        courses: selectedCourses.courses.map(course => ({
          courseName: course.courseName,
          courseType: course.courseType,
          menuItems: course.dishes || [], // Store selected dishes
          additionalNotes: course.additionalNotes || ''
        }))
      }
    }));
  };

  // Function to handle menu item selection
  const handleMenuSelection = (productId, courseName, selectedDishes) => {
    setSelectedMenuItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [courseName]: selectedDishes
      }
    }));
  };

  // Render catering menu selection modal
  const CateringMenuModal = ({ product, onClose }) => {
    const [selectedCourses, setSelectedCourses] = useState({
      courseType: product.catering.courseType,
      courses: product.catering.courses.map(course => ({
        courseName: course.courseName,
        courseType: course.courseType,
        dishes: [], // Start with empty selection
        additionalNotes: ''
      }))
    });

    const handleSave = () => {
      handleCateringDetails(product._id, selectedCourses);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Configure Menu</h2>
          
          {selectedCourses.courses.map((course, courseIndex) => (
            <div key={courseIndex} className="mb-6 border-b pb-4">
              <h3 className="text-xl font-semibold mb-2">{course.courseName}</h3>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {product.catering.courses[courseIndex].dishes.map((dish, dishIndex) => (
                      <label 
                        key={dishIndex}
                        className="cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={course.dishes.includes(dish)}
                          onChange={(e) => {
                            const newCourses = [...selectedCourses.courses];
                            if (e.target.checked) {
                              newCourses[courseIndex].dishes.push(dish);
                            } else {
                              newCourses[courseIndex].dishes = newCourses[courseIndex].dishes.filter(d => d !== dish);
                            }
                            setSelectedCourses({ ...selectedCourses, courses: newCourses });
                          }}
                        />
                        <span className={`inline-block px-3 py-1 rounded-full text-sm
                          ${course.dishes.includes(dish)
                            ? courseColors[course.courseName] || 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {dish}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="w-1/3">
                  <input
                    type="text"
                    placeholder="Additional Notes"
                    className="w-full px-3 py-1 text-sm border rounded-md"
                    value={course.additionalNotes}
                    onChange={(e) => {
                      const newCourses = [...selectedCourses.courses];
                      newCourses[courseIndex].additionalNotes = e.target.value;
                      setSelectedCourses({ ...selectedCourses, courses: newCourses });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleSave}
            >
              Save Menu
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Updated renderCateringMenuSelection function
  const renderCateringMenuSelection = (product) => {
    if (product.productId.category.toLowerCase() === 'catering') {
      const hasSelectedMenu = cateringDetails[product.productId._id];
      return (
        <div className="mt-2">
          <button
            className={`px-4 py-2 rounded ${
              hasSelectedMenu 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}
            onClick={() => {
              setSelectedProduct(product.productId);
              setShowCateringModal(true);
            }}
          >
            {hasSelectedMenu ? 'Menu Selected ✓' : 'Configure Menu'}
          </button>
          {hasSelectedMenu && (
            <div className="mt-2 text-sm text-gray-600">
              {cateringDetails[product.productId._id].courses.length} courses selected
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handlePosterCreation = () => {
    navigate('/social-media');
  };

  const handleAddressChange = () => {
    // Check user role from userDetails
    if (userDetails && userDetails.role) {
      switch (userDetails.role.toLowerCase()) {
        case 'vendor':
          navigate('/vendor-panel/my-profile');
          break;
        case 'customer':
          navigate('/user-panel/my-profile');
          break;
        case 'admin':
          navigate('/admin-panel/my-profile');
          break;
        default:
          toast.error('Unable to determine user role');
          break;
      }
    } else {
      toast.error('Please login to change address');
    }
  };

  // Toggle configuration details for a specific product
  const toggleConfigDetails = (productId) => {
    setShowConfigDetails(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Helper function to get the appropriate image for the product
  const getProductImage = (product) => {
    if (product?.productId?.category?.toLowerCase() === 'rent' && product?.rentalVariant) {
      // For rental products, use the first image from the matching variant
      const variant = product.productId.rentalVariants.find(
        v => v._id === product.rentalVariant.variantId
      );
      return variant?.images?.[0] || product?.productId?.productImage[0];
    }
    // For non-rental products, use the first product image
    return product?.productId?.productImage[0];
  };

  // Toggle menu details visibility
  const toggleMenuDetails = (productId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Render catering menu details with updated styling
  const renderCateringDetails = (product) => {
    if (product.productId.category.toLowerCase() === 'catering') {
      return (
        <div className="mt-2">
          {/* <button
            onClick={() => toggleMenuDetails(product.productId._id)}
            className="text-blue-600 hover:text-blue-800 underline focus:outline-none font-medium"
          >
            {expandedMenus[product.productId._id] ? 'Hide Details' : 'Show Details'}
          </button> */}
          
          {expandedMenus[product.productId._id] && (
            <div className="mt-3 pl-4 border-l-2 border-gray-200 bg-gray-50 p-4 rounded-md">
              <h4 className="font-semibold mb-3 text-gray-800">Selected Menu Items:</h4>
              
              {/* Appetizers/Hors d'oeuvre */}
              {product.configuration?.horsOeuvre?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-700 mb-2">Appetizers</h5>
                      <div className="flex flex-wrap gap-2">
                        {product.configuration.horsOeuvre.map((dish, index) => (
                          <span 
                            key={index} 
                            className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                          >
                            {dish}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Course */}
              {product.configuration?.mainCourse?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-700 mb-2">Main Course</h5>
                      <div className="flex flex-wrap gap-2">
                        {product.configuration.mainCourse.map((dish, index) => (
                          <span 
                            key={index} 
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {dish}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dessert */}
              {product.configuration?.dessert?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-700 mb-2">Dessert</h5>
                      <div className="flex flex-wrap gap-2">
                        {product.configuration.dessert.map((dish, index) => (
                          <span 
                            key={index} 
                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                          >
                            {dish}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Add this helper function to calculate the item price
  const getItemPrice = (product) => {
    if (product?.productId?.category?.toLowerCase() === 'rent' && product?.rentalVariant) {
      return product.rentalVariant.variantPrice;
    }
    return product?.productId?.price || 0;
  };

  // Update the renderRentalDetails function
  const renderRentalDetails = (product) => {
    if (product.productId.category.toLowerCase() === 'rent') {
      return null; // Don't render anything for rental products
    }
    return null;
  };

  // Updated handlePlaceOrder function
  const handlePlaceOrder = async () => {
    if (!userDetails || !userDetails.address) {
      toast.error("Please provide a valid delivery address.");
      return;
    }

    if (!deliveryDate) {
      toast.error("Please select a delivery date.");
      return;
    }

    // For rental products, validate dates using rentalDates state
    const hasInvalidRentalDates = data.some(product => {
      if (product.productId.category.toLowerCase() === 'rent') {
        const productDates = rentalDates[product._id];
        return !productDates?.startDate || !productDates?.endDate;
      }
      return false;
    });

    if (hasInvalidRentalDates) {
      toast.error("Please select both start and end dates for rental items.");
      return;
    }

    const orderDetails = {
      products: data.map((product) => {
        const productPrice = product.productId.category.toLowerCase() === 'rent' 
          ? Number(product.rentalVariant?.variantPrice || product.productId.price)
          : Number(product.productId.price);

        const baseProduct = {
          productId: product.productId._id,
          productName: product.productId.productName,
          quantity: Number(product.quantity),
          price: productPrice,
          category: product.productId.category,
          vendor: product.productId.user,
          vendorName: product.productId.brandName,
          image: product.productId.productImage[0]
        };

        // Add rental details if it's a rental product
        if (product.productId.category.toLowerCase() === 'rent' && product.rentalVariant) {
          const variantPrice = Number(product.rentalVariant.variantPrice) || 0;
          const quantity = Number(product.quantity);
          const totalRentalPrice = variantPrice * quantity;

          // Find the matching variant to get its image
          const selectedVariant = product.productId.rentalVariants.find(
            v => v._id === product.rentalVariant.variantId
          );

          baseProduct.additionalDetails = {
            rental: {
              variantName: product.rentalVariant.variantName || '',
              variantPrice: variantPrice,
              startDate: rentalDates[product._id]?.startDate || null,
              endDate: rentalDates[product._id]?.endDate || null,
              totalPrice: totalRentalPrice,
              fine: 0,
              isReturned: false,
              finePerDay: 2 * quantity,
              variantImage: selectedVariant?.images?.[0] || product.productId.productImage[0]
            }
          };
        }
        // Keep existing catering details handling
        else if (product.productId.category.toLowerCase() === 'catering') {
          baseProduct.additionalDetails = {
            catering: {
              courses: [
                {
                  courseName: 'Appetizer',
                  courseType: 'horsOeuvre',
                  menuItems: product.configuration?.horsOeuvre ? [product.configuration.horsOeuvre].flat() : [],
                  additionalNotes: '',
                  dietaryRestrictions: []
                },
                {
                  courseName: 'Main Course',
                  courseType: 'mainCourse',
                  menuItems: product.configuration?.mainCourse ? [product.configuration.mainCourse].flat() : [],
                  additionalNotes: '',
                  dietaryRestrictions: []
                },
                {
                  courseName: 'Dessert',
                  courseType: 'dessert',
                  menuItems: product.configuration?.dessert ? [product.configuration.dessert].flat() : [],
                  additionalNotes: '',
                  dietaryRestrictions: []
                }
              ]
            }
          };
        }

        return baseProduct;
      }),
      address: String(userDetails.address), // Ensure address is a string
      totalPrice: Number(totalPrice),
      discount: Number(discount),
      finalAmount: Number(finalAmount),
      userEmail: String(userDetails.email),
      userName: String(userDetails.name),
      deliveryDate: new Date(deliveryDate),
      status: "Pending"
    };

    console.log('Sending order details:', JSON.stringify(orderDetails, null, 2)); // Debug log

    try {
      const response = await fetch(SummaryApi.checkout.url, {
        method: SummaryApi.checkout.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to place order');
      }

      const responseData = await response.json();
      if (responseData.success) {
        handlePayment();
      } else {
        toast.error("Failed to place the order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing the order:", error);
      toast.error(error.message || "An error occurred while placing the order. Please try again.");
    }
  };

  // Add this function near your other state management functions
  const handleDateChange = (productId, dateType, value) => {
    setRentalDates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [dateType]: value
      }
    }));
  };

  // Toggle configuration visibility
  const toggleConfig = (itemId) => {
    setExpandedConfigs(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Helper function to render catering configuration
  const renderCateringConfig = (configuration) => {
    if (!configuration) return null;

    return (
      <div className="mt-2 space-y-2">
        {Object.entries(configuration).map(([courseType, dishes]) => {
          const colorClass = courseColors[courseType] || 'bg-gray-100 text-gray-800';
          
          return (
            <div key={courseType} className="pl-4">
              <div className="font-medium text-gray-700 mb-1">{courseType}:</div>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(dishes) && dishes.map((dish, index) => (
                  <span
                    key={index}
                    className={`text-sm px-2 py-1 rounded-full ${colorClass}`}
                  >
                    {dish}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Address Section with role-based redirect */}
      <div className="bg-white p-4 mb-1">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Delivery Address</h2>
          <button
            className="text-blue-500 hover:text-blue-700 hover:underline transition-colors duration-200"
            onClick={handleAddressChange}
          >
            Change
          </button>
        </div>
        {userDetails && userDetails.address
          ? userDetails.address
          : "No address available"}
      </div>

      {/* Poster Creation Button */}
      <div className="w-full flex justify-end pr-[8%] mb-2">
        <button
          className="group relative bg-gradient-to-r from-blue-600 to-blue-500 
          hover:from-blue-500 hover:to-blue-600 text-white px-8 py-3 rounded-full
          font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-300
          overflow-hidden"
          onClick={handlePosterCreation}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute w-2 h-full bg-white/20 skew-x-12 
              animate-[shimmer_2s_infinite] group-hover:pause"></div>
          </div>

          {/* Button content with glow effect */}
          <div className="relative flex items-center gap-2">
            <span className="relative">
              Create a Poster for Free
              {/* Glowing dot */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full 
                  bg-white opacity-75 animate-[ping_1.5s_infinite]"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 
                  bg-white"></span>
              </span>
            </span>
            {/* Animated arrow */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 transform group-hover:translate-x-1 transition-transform"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 8l4 4m0 0l-4 4m4-4H3" 
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Cart Items and Summary - Moved up */}
      <div className="flex flex-col lg:flex-row gap-8 lg:justify-between p-4 -mt-4">
        {/* Product List */}
        <div className="w-full max-w-3xl">
          {loading
            ? loadingCart.map((el, index) => (
                <div
                  key={el + "Add To Cart Loading" + index}
                  className="w-full bg-slate-200 h-32 my-1.5 border border-slate-300 animate-pulse rounded"
                ></div>
              ))
            : data.map((product, index) => (
                <div 
                  key={index} 
                  className="flex flex-col md:flex-row gap-6 bg-white rounded-xl p-6 mb-6 
                  border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md 
                  transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="w-full md:w-1/4">
                    <img
                      src={getProductImage(product)}
                      alt={product.productId.productName}
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {product.productId.productName}
                        </h3>
                        <p className="text-gray-600 mb-2">{product.productId.brandName}</p>
                        
                        {/* Variant Name and Price display for rental products */}
                        {product.productId.category.toLowerCase() === 'rent' && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-600">Selected Variant:</span>
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                                {product.rentalVariant?.variantName || 'Standard'}
                              </span>
                            </div>
                            <p className="text-lg font-medium text-green-600">
                              {displayINRCurrency(getItemPrice(product))}
                              <span className="text-sm text-gray-500 ml-2">
                                for {product.rentalVariant?.duration} days
                              </span>
                            </p>
                          </div>
                        )}
                        
                        {/* Regular product price */}
                        {product.productId.category.toLowerCase() !== 'rent' && (
                          <p className="text-lg font-medium text-green-600 mt-2">
                            {displayINRCurrency(getItemPrice(product))}
                          </p>
                        )}
                      </div>

                      {/* Existing quantity controls */}
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <button
                          onClick={() => decraseQty(product._id, product.quantity)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{product.quantity}</span>
                        <button
                          onClick={() => increaseQty(product._id, product.quantity)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => deleteCartProduct(product._id)}
                          className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Existing rental dates */}
                    {product.productId.category.toLowerCase() === 'rent' && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={rentalDates[product._id]?.startDate || ''}
                              onChange={(e) => handleDateChange(product._id, 'startDate', e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="block w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 
                                rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                hover:border-gray-400 transition-colors duration-200
                                appearance-none cursor-pointer
                                [&::-webkit-calendar-picker-indicator]:bg-transparent
                                [&::-webkit-calendar-picker-indicator]:hover:cursor-pointer
                                [&::-webkit-calendar-picker-indicator]:px-2
                                [&::-webkit-calendar-picker-indicator]:hover:opacity-60"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={rentalDates[product._id]?.endDate || ''}
                              onChange={(e) => handleDateChange(product._id, 'endDate', e.target.value)}
                              min={rentalDates[product._id]?.startDate || new Date().toISOString().split('T')[0]}
                              className="block w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 
                                rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                hover:border-gray-400 transition-colors duration-200
                                appearance-none cursor-pointer
                                [&::-webkit-calendar-picker-indicator]:bg-transparent
                                [&::-webkit-calendar-picker-indicator]:hover:cursor-pointer
                                [&::-webkit-calendar-picker-indicator]:px-2
                                [&::-webkit-calendar-picker-indicator]:hover:opacity-60"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Existing catering details */}
                    <div className="mt-2">
                      {renderCateringDetails(product)}
                    </div>

                    {/* Add Show Details link for catering items */}
                    {product.productId?.category?.toLowerCase() === 'catering' && product.configuration && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleConfig(product._id)}
                          className="text-blue-600 hover:text-blue-800 text-m font-medium underline"
                        >
                          {expandedConfigs[product._id] ? 'Hide Details' : 'Show Details'}
                        </button>
                        
                        {/* Show configuration only when expanded */}
                        {expandedConfigs[product._id] && (
                          <div className="mt-3 border-t pt-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              Selected Menu Configuration:
                            </div>
                            {renderCateringConfig(product.configuration)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-[350px] h-max bg-white border border-slate-200 rounded-md p-4">
          <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Subtotal ({totalQty} items)</span>
            <span className="font-medium">
              {displayINRCurrency(totalPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Discount</span>
            <span className="font-medium">3%</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">You save </span>
            <span className="font-medium text-red-400">
              {displayINRCurrency(discount)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600">Delivery Fee</span>
            <span
              className={`font-medium ${
                deliveryFee > 0 ? "text-black" : "text-green-600"
              }`}
            >
              {deliveryFee > 0 ? displayINRCurrency(deliveryFee) : "Free"}
            </span>
          </div>
          <hr className="my-2" />

          {/* Add delivery date form */}
          <form className="mb-4">
            <label
              htmlFor="deliveryDate"
              className="block text-lg font-medium text-red-600 mb-1"
            >
              When is the Event?
            </label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={deliveryDate}
              onChange={handleDeliveryDateChange}
              min={getMinDeliveryDate()}
              className="mt-1 block w-full rounded-md border-gray-700 text-md font-semibold text-blue-400 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </form>

          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">Total Amount</span>
            <span className="font-bold text-lg">
              {displayINRCurrency(finalAmount)}
            </span>
          </div>

          {/* Place Order Button */}
          <div className="mt-4">
            <button
              className="bg-red-600 hover:bg-red-700 transition-all duration-300 text-white w-full p-2 rounded"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

    
  <ConfirmationModal 
  isOpen={showPosterModal} 
  onClose={() => {
    setShowPosterModal(false); // Close the modal
    handlePayment(); // Proceed with payment
  }} 
  onConfirm={() => {
    navigate('/social-media'); // Redirect to the social media page
    setShowPosterModal(false); // Close the modal
  }} 
/>
      {showCateringModal && selectedProduct && (
        <CateringMenuModal
          product={selectedProduct}
          onClose={() => {
            setShowCateringModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default Cart;
