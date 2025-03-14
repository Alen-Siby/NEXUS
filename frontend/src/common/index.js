// Define both domains and use a fallback mechanism
const productionDomain = "https://nexus-backend-lpfd.onrender.com";
const localDomain = "http://localhost:8080";

// Function to check if a domain is reachable
const checkDomainAvailability = async (domain) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 3 second timeout
    
    const response = await fetch(`${domain}/api/health-check`, { 
      method: 'HEAD',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Initialize with production domain, will be updated after availability check
let backendDomain = localDomain;

// Immediately invoked function to set the correct domain
(async () => {
  // Try production domain first
  if (await checkDomainAvailability(productionDomain)) {
    backendDomain = productionDomain;
    console.log("Using production backend");
  } else {
    // Fallback to local domain
    backendDomain = productionDomain;
    console.log("Using local backend");
  }
})();

const SummaryApi = {
    signUP : {
        url : `${backendDomain}/api/signup`,
        method : "post"
    },
    signIn : {
        url : `${backendDomain}/api/signin`,
        method : "post"
    },
    current_user : {
        url : `${backendDomain}/api/user-details`,
        method : "get"
    },
    logout_user : {
        url : `${backendDomain}/api/userLogout`,
        method : 'get'
    },
    updateRole: {  // Add this part
        url: `${backendDomain}/api/update-role`,
        method: "post"
    },
    allUser : {
        url : `${backendDomain}/api/all-user`,
        method : 'get'
    },
    update_user : {
        url : `${backendDomain}/api/UpdateProfile`,
        method : 'put'
    },
    updateUser : {
        url : `${backendDomain}/api/update-user`,
        method : "post"
    },
    uploadProduct : {
        url : `${backendDomain}/api/upload-product`,
        method : 'post'
    },
    allProduct : {
        url : `${backendDomain}/api/get-product`,
        method : 'get'
    },

    updateProduct : {
        url : `${backendDomain}/api/update-product`,
        method  : 'post'
    },
    disableProduct : {
        url : `${backendDomain}/api/products`,
        method  : 'patch'
    },
    enableProduct : {
        url : `${backendDomain}/api/enable`,
        method  : 'patch'
    },
    categoryProduct : {
        url : `${backendDomain}/api/get-categoryProduct`,
        method : 'get'
    },
    categoryWiseProduct : {
        url : `${backendDomain}/api/category-product`,
        method : 'post'
    },
    productDetails : {
        url : `${backendDomain}/api/product-details`,
        method : 'post'
    },
    addToCartProduct : {
        url : `${backendDomain}/api/addtocart`,
        method : 'post'
    },
    
    addToCartWithConfig : {
        url : `${backendDomain}/api/addtocartwithconfig`,
        method : 'post'
    },
    addToCartWithVariant : {
        url : `${backendDomain}/api/addtocartwithvariant`,
        method : 'post'
    },
    
    addToCartProductCount : {
        url : `${backendDomain}/api/countAddToCartProduct`,
        method : 'get'
    },
    addToCartProductView : {
        url : `${backendDomain}/api/view-card-product`,
        method : 'get'
    },
    updateCartProduct : {
        url : `${backendDomain}/api/update-cart-product`,
        method : 'post'
    },
    deleteCartProduct : {
        url : `${backendDomain}/api/delete-cart-product`,
        method : 'post'
    },
    Banner_req : {
        url : `${backendDomain}/api/banner-request`,
        method : 'post'
    },
    Banner_view : {
        url : `${backendDomain}/api/banner-view`,
        method : 'get'
    },
    Banner_tog : {
        url : `${backendDomain}/api/togle-banner`,
        method : 'put'
    },
    Banner_status : {
        url : `${backendDomain}/api/updateBannerStatus`,
        method : 'put'
    },
   
    getmessages : {
        url : `${backendDomain}/api/contact-messages`,
        method : 'get'
    },
    categoryPro: {
        url: `${backendDomain}/api/categories`,
        method: 'get',
      },
    categoryAdd: {
        url: `${backendDomain}/api/category-add`,
        method: 'post',
      },
    toglecat: {
        url: `${backendDomain}/api/togle-cat`,
        method: 'put',
      },
    searchProduct : {
        url : `${backendDomain}/api/search`,
        method : 'get'
    },
    filterProduct : {
        url : `${backendDomain}/api/filter-product`,
        method : 'post'
    },
    event_add : {
        url : `${backendDomain}/api/create`,
        method : 'post'
    },
    user_events : {
        url : `${backendDomain}/api/events`,
        method : 'get'
    },
    events_del : {
        url : `${backendDomain}/api/events-del`,
        method : 'patch'
    },
   sponser : {
        url : `${backendDomain}/api/sponser`,
        method : 'patch'
    },
    checkout : {
        url : `${backendDomain}/api/checkout`,
        method : 'post'
    },
    orderDetails : {
        url : `${backendDomain}/api/order-view`,
        method : 'get'
    },
    cancelOrder : {
        url : `${backendDomain}/api/cancel-order`,
        method : 'post'
    },
    updateOrderWithPayment : {
        url : `${backendDomain}/api/updateOrderWithPayment`,
        method : 'post'
    },
    clear_cart : {
        url : `${backendDomain}/api/clear-cart`,
        method : 'delete'
    },
    submitRating : {
        url : `${backendDomain}/api/ratings`,
        method : 'post'
    },
    getRating : {
        url : `${backendDomain}/api/show-rating`,
        method : 'get'
    },
    forgot_password : {
        url : `${backendDomain}/api/forgot-password`,
        method : 'post'
    },
    verify_otp : {
        url : `${backendDomain}/api/verify-otp`,
        method : 'post'
    },
    resend_otp : {
        url : `${backendDomain}/api/resend-otp`,
        method : 'post'
    },
    google_login : {
        url : `${backendDomain}/auth/google`,
        method : 'get'
    },
    facebook_login : {
        url : `${backendDomain}/auth/facebook`,
        method : 'get'
    },
    deleteUser : {
        url : `${backendDomain}/api/delete-user`,
        method : 'delete'
    },
    generatePoster: {
        url: `${backendDomain}/api/generate-poster`,
        method: 'post'
    },
    
    portfolio: {
        url: `${backendDomain}/api/portfolio`,
        method: 'post'
    },
    
    get_portfolio: {
        url: `${backendDomain}/api/getportfolio`,
        method: 'get'
    },
    add_testimonial: {
        url: `${backendDomain}/api/testimonial`,
        method: 'post'
    },
    get_testimonial: {
        url: `${backendDomain}/api/gettestimonial`,
        method: 'post'
    },
    chat_message: {
        url: `${backendDomain}/api/message`,
        method: 'post'
    },
    updateOrderStatus: {
        url: `${backendDomain}/api/update-order-status`,
        method: 'put'
    },
    suggestPackages: {
        url: `${backendDomain}/api/suggest-packages`,
        method: 'post'
    },

    // Guest Management endpoints
    createGuestList: {
        url: `${backendDomain}/api/create-guest-list`,
        method: "post"
    },
    allGuestLists: {
        url: `${backendDomain}/api/all-guest-lists`,
        method: "get"
    },
    addToCartWithBakeryConfig: {
        url: `${backendDomain}/api/addtocartwithbakeryconfig`,
        method: 'post'
    },
}

export default SummaryApi
