import React, { useContext, useState, useEffect } from "react";
import Logo from "./Logo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoSearch, IoNotifications } from "react-icons/io5";
import { FaCog, FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import SummaryApi from "../common";
import { toast } from "react-toastify";
import { setUserDetails } from "../store/userSlice";
import Context from "../context";
import Cookies from 'js-cookie'; 
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaStar, FaCloud } from "react-icons/fa";
import { MdEventAvailable, MdAddBox } from "react-icons/md";
import { FaCalendarPlus, FaCalendarAlt } from "react-icons/fa";

// Add this CSS animation at the top of your file or in your global CSS
const bellRingAnimation = `
@keyframes bellRing {
  0% { transform: rotate(0); }
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-13deg); }
  60% { transform: rotate(10deg); }
  80% { transform: rotate(-8deg); }
  100% { transform: rotate(0); }
}

.bell-animation:hover {
  animation: bellRing 0.5s ease;
  transform-origin: top center;
}
`;

const Header = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuDisplay, setMenuDisplay] = useState(false);
  const context = useContext(Context);
  const { isDarkMode, toggleTheme } = useTheme();
  const searchInput = useLocation();
  const URLSearch = new URLSearchParams(searchInput?.search);
  const searchQuery = URLSearch.getAll("q");
  const [search, setSearch] = useState(searchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [clearedNotifications, setClearedNotifications] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('clearedNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // console.log("userdetails=",user)
  const getCookie = () => {
    const token = Cookies.get("token"); // Replace 'token' with your actual cookie name
    console.log('Cookie token:', token);
    return token;
  };
  const handleLogout = async () => {
    const fetchData = await fetch(SummaryApi.logout_user.url, {
      method: SummaryApi.logout_user.method,
      credentials: "include",
    });

    const data = await fetchData.json();
       console.log(data)
    if (data.success) {
      // Cookies.remove('token');
      toast.success(data.message);
      dispatch(setUserDetails(null));
      navigate("/", { replace: true });
    }

    if (data.error) {
      toast.error(data.message);
    }
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearch(value);

    if (value) {
      navigate(`/search?q=${value}`);
    } else {
      navigate("/search");
    }
  };

  // Navigate to the create-event page
  const goToCreateEvent = () => {
    navigate("/create-event");
  };

  useEffect(() => {
    getCookie();
  }, []);

  // Updated getNavigationPath function with correct path
  const getNavigationPath = (userRole) => {
    switch (userRole) {
      case 'Vendor':
        return '/vendor-panel/vendor-order';
      case 'Admin':
        return '/admin-panel/admin-order';
      case 'Customer':
        return '/user-panel/orders';
      default:
        return '/';
    }
  };

  // Updated fetch notifications function to filter out cleared notifications
  const fetchNotifications = async () => {
    if (user?.role === 'Vendor' || user?.role === 'Customer' || user?.role === 'Admin') {
      try {
        const response = await fetch(SummaryApi.orderDetails.url, {
          method: SummaryApi.orderDetails.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        
        if (user.role === 'Vendor') {
          const vendorOrders = data.data
            .filter(order => 
              order.products.some(product => 
                product.vendor === user.email && 
                order.status.toLowerCase() === 'ordered'
              ) && 
              !clearedNotifications.includes(order._id)
            )
            .map(order => ({
              id: order._id,
              title: `New Order #${order.invoiceNumber}`,
              message: `Order received for ${order.products.length} item(s)`,
              time: new Date(order.createdAt),
              link: getNavigationPath('Vendor')
            }));
          setNotifications(vendorOrders);
          setNotificationCount(vendorOrders.length);
        } 
        else if (user.role === 'Customer') {
          const customerOrders = data.data
            .filter(order => 
              order.userEmail === user.email && 
              (order.status.toLowerCase() === 'accepted' || order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered') &&
              !clearedNotifications.includes(order._id)
            )
            .map(order => ({
              id: order._id,
              title: `Order ${order.status} #${order.invoiceNumber}`,
              message: `Your order has been ${order.status.toLowerCase()}`,
              time: new Date(order.createdAt),
              link: getNavigationPath('Customer')
            }));
          setNotifications(customerOrders);
          setNotificationCount(customerOrders.length);
        }
        else if (user.role === 'Admin') {
          const adminOrders = data.data
            .filter(order => 
              !clearedNotifications.includes(order._id) && 
              (order.status.toLowerCase() === 'ordered' || order.status.toLowerCase() === 'accepted')
            )
            .map(order => ({
              id: order._id,
              title: `Order Update #${order.invoiceNumber}`,
              message: `New ${order.status.toLowerCase()} order from ${order.userName}`,
              time: new Date(order.createdAt),
              link: getNavigationPath('Admin')
            }));
          setNotifications(adminOrders);
          setNotificationCount(adminOrders.length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
  };

  // Updated clearAllNotifications function to persist cleared notifications
  const clearAllNotifications = () => {
    const notificationIds = notifications.map(notification => notification.id);
    const updatedClearedNotifications = [...clearedNotifications, ...notificationIds];
    
    // Update state
    setClearedNotifications(updatedClearedNotifications);
    setNotifications([]);
    setNotificationCount(0);
    setShowNotifications(false);
    
    // Save to localStorage
    localStorage.setItem('clearedNotifications', JSON.stringify(updatedClearedNotifications));
  };

  // Clear single notification
  const clearNotification = (notificationId) => {
    const updatedClearedNotifications = [...clearedNotifications, notificationId];
    
    // Update state
    setClearedNotifications(updatedClearedNotifications);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setNotificationCount(prev => prev - 1);
    
    // Save to localStorage
    localStorage.setItem('clearedNotifications', JSON.stringify(updatedClearedNotifications));
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    navigate(notification.link);
    setShowNotifications(false);
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for status updates
    window.addEventListener('orderStatusUpdated', fetchNotifications);

    // Set up polling interval as backup
    const intervalId = setInterval(fetchNotifications, 5000); // Poll every 5 seconds

    // Listen for database changes
    const eventSource = new EventSource(`${SummaryApi.baseURL}/api/order-updates`);
    
    eventSource.onmessage = (event) => {
      fetchNotifications();
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('orderStatusUpdated', fetchNotifications);
      eventSource.close();
    };
  }, [user]);

  // console.log(user)

  return (
    <>
      {/* Add the animation styles */}
      <style>{bellRingAnimation}</style>

      <header className={`h-20 shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} fixed w-full z-40 transition-colors duration-200`}>
        <div className='h-full container mx-auto flex items-center px-6 justify-between'>
          <Link to={"/"} className="flex-shrink-0 transition-transform hover:scale-105">
            <Logo w={150} h={70} className="md:w-[190px]" />
          </Link>

          <div className="hidden md:flex items-center gap-6 flex-grow justify-between pl-40">
            <button
              onClick={toggleTheme}
              className={`
                w-14 h-7 rounded-full relative transition-all duration-300 ease-in-out focus:outline-none 
                ${isDarkMode 
                  ? 'bg-gray-700 border-2 border-blue-400 hover:border-blue-300' 
                  : 'bg-blue-100 border-2 border-yellow-400 hover:border-yellow-300'}
                transform hover:scale-105
              `}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode && (
                <>
                  <FaStar className="absolute text-[8px] text-yellow-300 top-1 left-1.5" />
                  <FaStar className="absolute text-[8px] text-yellow-300 bottom-1 left-2.5" />
                  <FaStar className="absolute text-[8px] text-yellow-300 top-2 left-3.5" />
                </>
              )}
              
              <div
                className={`
                  absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full 
                  transition-all duration-300 ease-in-out
                  ${isDarkMode ? 'translate-x-8 bg-gray-800' : 'translate-x-1 bg-yellow-400'}
                  flex items-center justify-center shadow-md
                `}
              >
                {isDarkMode ? (
                  <FaMoon className="text-xs text-blue-300" />
                ) : (
                  <FaSun className="text-xs text-yellow-600" />
                )}
              </div>

              {!isDarkMode && (
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                  <div className="w-full h-full flex justify-between items-center px-1">
                    <FaCloud className="text-blue-500 text-xs" />
                    <FaCloud className="text-blue-500 text-xs p" />
                  </div>
                </div>
              )}
            </button>

            <div className={`flex items-center rounded-full focus-within:ring-2 focus-within:ring-blue-400 pl-2 w-1/3 border-2 transition-all duration-200 ${
              isDarkMode 
                ? 'border-gray-700 hover:border-gray-600' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type='text'
                placeholder='Search product here...'
                className={`w-full outline-none p-2.5 rounded-l-full ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white text-black'
                }`}
                onChange={handleSearch}
                value={search}
              />
              <div className={`text-lg min-w-[60px] h-11 flex items-center justify-center rounded-r-full ${
                isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-black hover:bg-gray-800'
              } text-white transition-colors duration-200`}>
                <IoSearch />
              </div>
            </div>

            <div className='flex items-center gap-8'>
              {user?._id && (
                <>
                  {user.role === 'Customer' && (
                    <button
                      onClick={() => navigate('/create-event')}
                      className={`
                        px-4 py-2 rounded-full 
                        ${isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-blue-500 hover:bg-blue-600'
                        } 
                        text-white transition-all duration-200 
                        transform hover:scale-105 flex items-center gap-2
                        group
                      `}
                      title="Create New Event"
                    >
                      <div className="relative">
                        <FaCalendarAlt className="h-5 w-5 group-hover:opacity-0 absolute transition-opacity duration-200" />
                        <FaCalendarPlus className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                      <span className="relative">
                        Create Event
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                      </span>
                    </button>
                  )}

                  <div className='relative'>
                    <div 
                      className='text-2xl relative cursor-pointer bell-animation hover:text-blue-500 transition-colors duration-200'
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <IoNotifications />
                      {notificationCount > 0 && (
                        <div className='bg-red-500 text-white w-5 h-5 rounded-full p-1 flex items-center justify-center absolute -top-2 -right-3 transform scale-90 hover:scale-100 transition-transform duration-200'>
                          <p className='text-sm'>{notificationCount > 99 ? '99+' : notificationCount}</p>
                        </div>
                      )}
                    </div>

                    {/* Updated Notifications Dropdown */}
                    {showNotifications && (
                      <div className={`absolute right-0 mt-2 w-80 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden z-50`}>
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Notifications</h3>
                            {notifications.length > 0 && (
                              <button
                                onClick={clearAllNotifications}
                                className="text-sm text-red-500 hover:text-red-600"
                              >
                                Clear All
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No new notifications
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-200 ${
                                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleNotificationClick(notification)}
                                  >
                                    <h4 className="font-medium">{notification.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {notification.message}
                                    </p>
                                    <span className="text-xs text-gray-400">
                                      {new Date(notification.time).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearNotification(notification.id);
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    title="Clear notification"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='relative flex justify-center'>
                    <div
                      className='cursor-pointer relative flex items-center gap-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200'
                      onClick={() => setMenuDisplay((prev) => !prev)}
                    >
                      <div className='flex flex-col'>
                        <p className='text-xs font-medium capitalize opacity-75'>hello,</p>
                        <p className='text-sm font-bold capitalize'>{user?.name}</p>
                      </div>
                      {user?.profilePic ? (
                        <img src={user?.profilePic} className='w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600' alt={user?.name} />
                      ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-600 dark:text-gray-300" />
                      )}
                    </div>

                    {menuDisplay && (
                      <div className={`absolute ${isDarkMode ? 'bg-gray-800' : 'bg-white'} bottom-0 top-11 h-fit p-2 shadow-lg rounded-2xl transition-transform transform scale-95 origin-top duration-200`}>
                        <nav>
                          <div className="px-4 py-2 border-b border-gray-200">
                          </div>
                          {user?.role === "Vendor" && (
                            <Link
                              to={"/vendor-panel/vendor-products"}
                              className={`flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                              onClick={() => setMenuDisplay(false)}
                            >
                              <FaCog className="text-lg" />
                              <span>Vendor Panel</span>
                            </Link>
                          )}
                          {user?.role === "Admin" && (
                            <Link
                              to={"/admin-panel/all-products"}
                              className={`flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                              onClick={() => setMenuDisplay(false)}
                            >
                              <FaUserCircle className="text-lg" />
                              <span>Admin Panel</span>
                            </Link>
                          )}
                          {user?.role === "Customer" && (
                            <>
                              <Link
                                to={"/user-panel"}
                                className={`flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                onClick={() => setMenuDisplay(false)}
                              >
                                <FaUserCircle className="text-lg" />
                                <span>My Account</span>
                              </Link>
                              <Link
                                to={"/user-panel/orders"}
                                className={`flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                onClick={() => setMenuDisplay(false)}
                              >
                                <FaShoppingCart className="text-lg" />
                                <span>My Orders</span>
                              </Link>
                            </>
                          )}
                        </nav>
                      </div>
                    )}
                  </div>

                  <Link to={"/cart"} className='text-2xl relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200'>
                    <FaShoppingCart />
                    <div className='bg-red-500 text-white w-5 h-5 rounded-full p-1 flex items-center justify-center absolute -top-1 -right-1 transform scale-90 hover:scale-100 transition-transform duration-200'>
                      <p className='text-sm'>{context?.cartProductCount || 0}</p>
                    </div>
                  </Link>
                </>
              )}

              <div>
                {user?._id ? (
                  <button
                    onClick={handleLogout}
                    className='px-6 py-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 transform hover:scale-105 flex items-center gap-2'
                  >
                    <FaUserCircle className="text-lg" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to={"/login"}
                    className='px-6 py-2 rounded-full text-white bg-green-500 hover:bg-green-600 transition-colors duration-200 transform hover:scale-105'
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4 flex-grow justify-between max-w-[calc(100%-160px)]">
            <div className={`flex items-center rounded-full focus-within:ring-2 focus-within:ring-blue-400 pl-2 flex-grow max-w-[180px] border-2 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <input
                type='text'
                placeholder='Search...'
                className={`w-full outline-none p-2.5 rounded-l-full text-sm ${
                  isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-black'
                }`}
                onChange={handleSearch}
                value={search}
              />
              <div className={`text-lg min-w-[40px] h-10 flex items-center justify-center rounded-r-full ${
                isDarkMode ? 'bg-gray-600' : 'bg-black'
              } text-white`}>
                <IoSearch />
              </div>
            </div>

            <div className='relative ml-2'>
              {user?._id ? (
                <div className='flex items-center gap-3'>
                  <div className='text-xl relative cursor-pointer bell-animation'>
                    <IoNotifications 
                      className={`transition-colors duration-200 ${
                        isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'
                      }`}
                    />
                    <div className='bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center absolute -top-1 -right-1 text-[10px]'>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </div>
                  </div>

                  <div
                    className='text-2xl cursor-pointer w-10 h-10 flex items-center justify-center'
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {user?.profilePic ? (
                      <img src={user?.profilePic} className='w-8 h-8 rounded-full' alt={user?.name} />
                    ) : (
                      <FaUserCircle className="w-6 h-6" />
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className='px-3 py-1.5 rounded-full text-white text-sm bg-green-600 hover:bg-green-700 whitespace-nowrap'
                >
                  Login
                </Link>
              )}

              {mobileMenuOpen && (
                <div className={`absolute right-0 top-11 w-48 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-2 z-50`}>
                  {user?._id ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold">Hello, {user?.name}</p>
                      </div>
                      {user?.role === "Customer" && (
                        <>
                          <Link
                            to={"/user-panel"}
                            className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            My Account
                          </Link>
                          <Link
                            to={"/create-event"}
                            className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} flex items-center gap-2`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <FaCalendarPlus className="h-4 w-4" />
                            Create Event
                          </Link>
                          <Link
                            to={"/user-panel/orders"}
                            className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            My Orders
                          </Link>
                        </>
                      )}
                      {user?.role === "Vendor" && (
                        <Link
                          to={"/vendor-panel/vendor-products"}
                          className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Vendor Panel
                        </Link>
                      )}
                      {user?.role === "Admin" && (
                        <Link
                          to={"/admin-panel/all-products"}
                          className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        to={"/cart"}
                        className={`block px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} flex items-center gap-2`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FaShoppingCart className="h-4 w-4" />
                        Cart ({context?.cartProductCount || 0})
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to={"/login"}
                      className="block px-4 py-2 text-green-600 hover:bg-green-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      toggleTheme();
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
