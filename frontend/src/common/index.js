const backendDomin = "https://nexus-backend-lpfd.onrender.com"
// const backendDomin = "http://localhost:8080"




const SummaryApi = {
    signUP : {
        url : `${backendDomin}/api/signup`,
        method : "post"
    },
    signIn : {
        url : `${backendDomin}/api/signin`,
        method : "post"
    },
    current_user : {
        url : `${backendDomin}/api/user-details`,
        method : "get"
    },
    logout_user : {
        url : `${backendDomin}/api/userLogout`,
        method : 'get'
    },
    updateRole: {  // Add this part
        url: `${backendDomin}/api/update-role`,
        method: "post"
    },
    allUser : {
        url : `${backendDomin}/api/all-user`,
        method : 'get'
    },
    update_user : {
        url : `${backendDomin}/api/UpdateProfile`,
        method : 'put'
    },
    updateUser : {
        url : `${backendDomin}/api/update-user`,
        method : "post"
    },
    uploadProduct : {
        url : `${backendDomin}/api/upload-product`,
        method : 'post'
    },
    allProduct : {
        url : `${backendDomin}/api/get-product`,
        method : 'get'
    },

    updateProduct : {
        url : `${backendDomin}/api/update-product`,
        method  : 'post'
    },
    disableProduct : {
        url : `${backendDomin}/api/products`,
        method  : 'patch'
    },
    enableProduct : {
        url : `${backendDomin}/api/enable`,
        method  : 'patch'
    },
    categoryProduct : {
        url : `${backendDomin}/api/get-categoryProduct`,
        method : 'get'
    },
    categoryWiseProduct : {
        url : `${backendDomin}/api/category-product`,
        method : 'post'
    },
    productDetails : {
        url : `${backendDomin}/api/product-details`,
        method : 'post'
    },
    addToCartProduct : {
        url : `${backendDomin}/api/addtocart`,
        method : 'post'
    },
    
    addToCartWithConfig : {
        url : `${backendDomin}/api/addtocartwithconfig`,
        method : 'post'
    },
    addToCartWithVariant : {
        url : `${backendDomin}/api/addtocartwithvariant`,
        method : 'post'
    },
    
    addToCartProductCount : {
        url : `${backendDomin}/api/countAddToCartProduct`,
        method : 'get'
    },
    addToCartProductView : {
        url : `${backendDomin}/api/view-card-product`,
        method : 'get'
    },
    updateCartProduct : {
        url : `${backendDomin}/api/update-cart-product`,
        method : 'post'
    },
    deleteCartProduct : {
        url : `${backendDomin}/api/delete-cart-product`,
        method : 'post'
    },
    Banner_req : {
        url : `${backendDomin}/api/banner-request`,
        method : 'post'
    },
    Banner_view : {
        url : `${backendDomin}/api/banner-view`,
        method : 'get'
    },
    Banner_tog : {
        url : `${backendDomin}/api/togle-banner`,
        method : 'put'
    },
    Banner_status : {
        url : `${backendDomin}/api/updateBannerStatus`,
        method : 'put'
    },
   
    getmessages : {
        url : `${backendDomin}/api/contact-messages`,
        method : 'get'
    },
    categoryPro: {
        url: `${backendDomin}/api/categories`,
        method: 'get',
      },
    categoryAdd: {
        url: `${backendDomin}/api/category-add`,
        method: 'post',
      },
    toglecat: {
        url: `${backendDomin}/api/togle-cat`,
        method: 'put',
      },
    searchProduct : {
        url : `${backendDomin}/api/search`,
        method : 'get'
    },
    filterProduct : {
        url : `${backendDomin}/api/filter-product`,
        method : 'post'
    },
    event_add : {
        url : `${backendDomin}/api/create`,
        method : 'post'
    },
    user_events : {
        url : `${backendDomin}/api/events`,
        method : 'get'
    },
    events_del : {
        url : `${backendDomin}/api/events-del`,
        method : 'patch'
    },
   sponser : {
        url : `${backendDomin}/api/sponser`,
        method : 'patch'
    },
    checkout : {
        url : `${backendDomin}/api/checkout`,
        method : 'post'
    },
    orderDetails : {
        url : `${backendDomin}/api/order-view`,
        method : 'get'
    },
    cancelOrder : {
        url : `${backendDomin}/api/cancel-order`,
        method : 'post'
    },
    updateOrderWithPayment : {
        url : `${backendDomin}/api/updateOrderWithPayment`,
        method : 'post'
    },
    clear_cart : {
        url : `${backendDomin}/api/clear-cart`,
        method : 'delete'
    },
    submitRating : {
        url : `${backendDomin}/api/ratings`,
        method : 'post'
    },
    getRating : {
        url : `${backendDomin}/api/show-rating`,
        method : 'get'
    },
    forgot_password : {
        url : `${backendDomin}/api/forgot-password`,
        method : 'post'
    },
    verify_otp : {
        url : `${backendDomin}/api/verify-otp`,
        method : 'post'
    },
    resend_otp : {
        url : `${backendDomin}/api/resend-otp`,
        method : 'post'
    },
    google_login : {
        url : `${backendDomin}/auth/google`,
        method : 'get'
    },
    facebook_login : {
        url : `${backendDomin}/auth/facebook`,
        method : 'get'
    },
    deleteUser : {
        url : `${backendDomin}/api/delete-user`,
        method : 'delete'
    },
    generatePoster: {
        url: `${backendDomin}/api/generate-poster`,
        method: 'post'
    },
    
    portfolio: {
        url: `${backendDomin}/api/portfolio`,
        method: 'post'
    },
    
    get_portfolio: {
        url: `${backendDomin}/api/getportfolio`,
        method: 'get'
    },
    add_testimonial: {
        url: `${backendDomin}/api/testimonial`,
        method: 'post'
    },
    get_testimonial: {
        url: `${backendDomin}/api/gettestimonial`,
        method: 'post'
    },
    chat_message: {
        url: `${backendDomin}/api/message`,
        method: 'post'
    },
    updateOrderStatus: {
        url: `${backendDomin}/api/update-order-status`,
        method: 'put'
    },
    suggestPackages: {
        url: `${backendDomin}/api/suggest-packages`,
        method: 'post'
    },

    // Guest Management endpoints
    createGuestList: {
        url: `${backendDomin}/api/create-guest-list`,
        method: "post"
    },
   
}

export default SummaryApi
