const express = require('express')


const router = express.Router()

const userSignUpController = require("../controller/user/userSignUp")
const userSignInController = require('../controller/user/userSignIn')
const {userDetailsController,updateUserDetailsController} = require('../controller/user/userDetails')
const authToken = require('../middleware/authToken')
const userLogout = require('../controller/user/userLogout')
// const { updateUserRole } = require('../controller/userController');

const updateRoleController = require('../controller/user/updateRoleController');
const allUsers = require('../controller/user/allUsers')
const updateUser = require('../controller/user/updateUser')
const UploadProductController = require('../controller/product/uploadProduct')
const getProductController = require('../controller/product/getProduct')
const updateProductController = require('../controller/product/updateProduct')
const { disableProduct , enableProduct, updateSponsorStatus } = require('../controller/product/productController'); // Adjust the path to your controller
const verifyEmailController = require('../controller/user/verifyEmailController')
const { forgotPassword, resetPassword, verifyOtp, resendOtp } = require('../controller/user/forgotPasswordController')
const { getUserByEmail } = require('../controller/user/fetchuser')
const getCategoryProduct = require('../controller/product/getCategoryProductOne')
const getCategoryWiseProduct = require('../controller/product/getCategoryWiseProduct')
const getProductDetails = require('../controller/product/getProductDetails')
const { addToCartController, addToCartWithConfigController, addToCartWithVariantController, addToCartWithBakeryConfigController } = require('../controller/user/addToCartController')
const countAddToCartProduct = require('../controller/user/countAddToCartProduct')
const addToCartViewProduct = require('../controller/user/addToCartViewProduct')
const updateAddToCartProduct = require('../controller/user/updateAddToCartProduct')
const deleteAddToCartProduct = require('../controller/user/deleteAddToCartProduct')

const { handleContactForm, getAllContactMessages } = require('../controller/user/contactController');
const { handleBannerRequest,fetchBanners,toggleBannerStatus,updateBannerStatus } = require('../controller/user/bannerController')

// const { updateUserRole } = require('../controller/userController');

const { getAllCategories, addCategory,toggleCategory } = require('../controller/product/categoryController');

const searchProduct = require('../controller/product/searchProduct')
const filterProductController = require('../controller/product/filterProduct')
const { createEvent, getEvents, updateEventStatus } = require('../controller/user/eventController')
const { 
    createOrUpdateOrder, 
    getAllOrders, 
    updateOrderWithPayment, 
    cancelOrder,
    updateOrderStatus 
} = require('../controller/user/orderController')
const { clearCart } = require('../controller/user/cartController')
const { addRatingReview, getRatingDetails } = require('../controller/user/ratingController')
const { deleteUser } = require('../controller/user/userController')
// const posterController = require('../controller/user/posterController'); // Import the poster controller
// const upload = require('../middleware/uploadMiddleware'); // Import the upload middleware
const { generatePoster } = require('../controller/user/generatePosterController')
const portfolioController = require('../controller/user/portfolioController')
const testimonialController = require('../controller/user/testimonialController')
const chatController = require('../controller/user/chatController')
const suggestPackagesController = require('../controller/user/suggestPackagesController')


const { 
    createGuestList, 
    getGuestList, 
    getVendorGuestLists, 
    updateGuestStatus 
  } = require('../controller/user/guestcontroller');
  const guestController = require('../controller/user/guestcontroller');


// Import the controller









router.post("/signup",userSignUpController)
router.post("/signin",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.get("/userLogout",userLogout)
// router.post('/update-role', updateUserRole);
router.post('/api/update-role', updateRoleController);
router.delete('/delete-user/:userId', deleteUser);
router.get('/verify-email', verifyEmailController);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/fetch-user/:email', getUserByEmail);
// router.post('/sendVerificationLink', sendVerificationLink);
router.put('/UpdateProfile',authToken, updateUserDetailsController);
router.post('/create', createEvent);
router.get('/events', getEvents);
router.patch('/events-del/:id', updateEventStatus);



//admin panel
router.get("/all-user",authToken,allUsers)
router.post("/update-user",authToken,updateUser)





//product routes
router.post("/upload-product",authToken,UploadProductController)
router.get("/get-product",getProductController)
router.post("/update-product",authToken,updateProductController)

router.patch('/products/:id', disableProduct);
router.patch('/enable/:id', enableProduct);
router.get("/get-categoryProduct",getCategoryProduct)
router.post("/category-product",getCategoryWiseProduct)
router.post("/product-details",getProductDetails)
router.patch("/sponser/:id",updateSponsorStatus)
router.get('/categories', getAllCategories);
router.post("/filter-product",filterProductController)

// Route to add a new category
router.post('/category-add', addCategory);
router.put('/togle-cat/:id', toggleCategory);

router.post("/upload-product",authToken,UploadProductController)
router.get("/get-product",getProductController)
router.post("/update-product",authToken,updateProductController)
router.get("/search",searchProduct)


//add to cart


router.post("/addtocart", authToken, addToCartController)
router.post("/addtocartwithconfig", authToken, addToCartWithConfigController)
router.post("/addtocartwithvariant", authToken, addToCartWithVariantController)
router.get("/countAddToCartProduct",authToken,countAddToCartProduct)
router.get("/view-card-product",authToken,addToCartViewProduct)
router.post("/update-cart-product",authToken,updateAddToCartProduct)
router.post("/delete-cart-product",authToken,deleteAddToCartProduct)
router.post('/checkout', createOrUpdateOrder);
router.get('/order-view',getAllOrders);
router.post('/cancel-order',cancelOrder);
router.post('/updateOrderWithPayment', updateOrderWithPayment);
router.put('/update-order-status/:orderId', updateOrderStatus);
router.delete('/clear-cart', authToken, clearCart);
router.post('/ratings', addRatingReview);
router.get('/show-rating',getRatingDetails)
//contacts

router.post('/contact', handleContactForm);
router.post('/banner-request', handleBannerRequest);
router.get('/banner-view', fetchBanners);
router.put('/togle-banner/:bannerId', toggleBannerStatus);
router.put('/updateBannerStatus/:id', updateBannerStatus);

router.get('/contact-messages', getAllContactMessages);


  


// generate poster 

router.post('/generate-poster', generatePoster);


// Portfolio routes
router.post('/portfolio', authToken, portfolioController.storeFormData);
router.post('/getportfolio', portfolioController.getPortfolioDetails);


// Testimonial routes
router.post('/testimonial', testimonialController.addTestimonial);
router.post('/gettestimonial', testimonialController.getVendorTestimonials);



router.post('/message', chatController.handleMessage)

router.post('/suggest-packages', suggestPackagesController.suggestPackages)


//guest management 

router.get('/all-guest-lists', guestController.getAllGuestLists);


// Define the route for creating a guest list
router.post('/create-guest-list', authToken, createGuestList); // Adjust the path as necessary

router.post('/addtocartwithbakeryconfig', authToken, addToCartWithBakeryConfigController);

module.exports = router

