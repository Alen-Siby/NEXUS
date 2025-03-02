import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Home from '../pages/Home'
import Login from '../pages/Login'

import Vendorpage from '../pages/Vendorpage'
import ForgotPassowrd from '../pages/ForgotPassowrd'
import SignUp from '../pages/SignUp'
import AdminPanel from '../pages/AdminPanel'
import Vendorpanel from '../pages/Vendorpanel'
import SelectRole from '../pages/SelectRole'
import AdminPage from '../pages/AdminPage'

import AllUsers from '../pages/AllUsers'
import AllProducts from '../pages/AllProducts'

import VendorProducts from '../pages/VendorProducts'
import VerifyEmail from '../pages/VerifyEmail'
import ResetPassword from '../pages/ResetPassword'
import CategoryProduct from '../pages/CategoryProduct'
import Home2 from '../pages/Home2'
import ProductDetails from '../pages/ProductDetails'
import Cart from '../pages/Cart'
import ContactUs from '../pages/ContactUs'
import ContactMessages from '../pages/contact-messages'
import BannerRequest from '../pages/BannerRequest'
import Banners from '../pages/Banners'
import MyOrders from '../pages/MyOrders'
import UserPanel from '../pages/UserPanel'
import AboutUs from '../pages/AboutUs'
import CatergoryAdd from '../pages/CatergoryAdd'
import MyProfile from '../pages/MyProfile'
import SearchProduct from '../pages/SearchProduct'
import CreateEvent from '../pages/CreateEvent'
import CoperateInfo from '../pages/CoperateInfo'
import PrivacyPolicy from '../pages/PrivacyPolicy'
import TermsAndConditions from '../pages/TermsAndConditions'
import MyEvents from '../pages/MyEvents'
import RecomendedEvents from '../pages/RecomendedEvents'
import SponserAdd from '../pages/SponserAdd'
import NotFound from '../pages/404'

import PaymentSuccess from '../pages/PaymentSuccess'
import Chat from '../pages/Chat'
import RatingView from '../pages/RatingView'
import VendorReport from '../pages/VendorReport'
import SocialMedia from '../pages/SocialMedia'
import Portfolio from '../pages/Portfolio'
import VendorOrders from '../pages/VendorOrders'
import GuestManagement from '../pages/GuestManagement'

// import ContactMessage from '../../../backend/models/ContactMessage'











const router = createBrowserRouter([
    {
        path : "/",
        element : <App/>,
        children : [
            {
                path : "",
                element : <Home/>
            },
            {
                path : "home2",
                element : <Home2/>
            },

            {
                path : "login",
                element : <Login/>
            },
            {
                path: "select-role", // New route for SelectRole
                element: <SelectRole />
            },
         
        
            {
                path : "forgot-password",
                element : <ForgotPassowrd/>
            },
            {
                path : "sign-up",
                element : <SignUp/>
            },
            {
                path : "vendor/:vendorName", // Update to accept vendor name as a parameter
                element : <Vendorpage/>
            },
            {
                path : "admin-page",
                element : <AdminPage/>
            },

            {
                path : "verify-email",
                element : <VerifyEmail/>
            },
            {
                path : "reset-password",
                element : <ResetPassword/>
            },
            {
                path : "product-category",
                element : <CategoryProduct/>
            },
            {
                path : "product/:id",
                element : <ProductDetails/>
            },
            {
                path : 'cart',
                element : <Cart/>
            },
            {
                path : 'contact',
                element : <ContactUs/>
            },
            {
                path : 'about',
                element : <AboutUs/>
            },
            {
                path : "search",
                element : <SearchProduct/>
            },
            {
                path : "create-event",
                element : <CreateEvent/>
            },
            {
                path : "corporate-info",
                element : <CoperateInfo/>
            },
            {
                path : 'privacy-policy',
                element : <PrivacyPolicy/>
            },
            {
                path : 'terms-conditions',
                element : <TermsAndConditions/>
            },
            {
                path : 'recomendated-events',
                element : <RecomendedEvents/>
            },
            {
                path : '*',
                element : <NotFound/>
            },
            {
                path : 'payment-success',
                element : <PaymentSuccess/>
            },
            {
                    path : 'chat',
                    element : <Chat/>
             },
             {
                path : 'social-media',
                element : <SocialMedia/>
             },
           
          
           
           
            





            {
                path : "admin-panel",
                element : <AdminPanel/>,
                children : [
                    {
                        path : "all-users",
                        element : <AllUsers/>
                    },
                    {
                        path : "all-products",
                        element : <AllProducts/>
                    },
                    {
                        path : "contact-msg",
                        element : <ContactMessages/>
                    },
                    {
                        path : "banner-admin",
                        element : <Banners/>
                    },
                    {
                        path : "category-add",
                        element : <CatergoryAdd/>
                    },
                    {
                        path : 'my-profile',
                        element : <MyProfile/>
                    },
                    {
                        path : 'vendor-order',
                        element : <VendorOrders/>
                    },
                    {
                        path : 'vendor-report',
                        element : <VendorReport/>
                    },
                    {
                        path : 'rating',
                        element : <RatingView/>
                    },
                    
                   
                    
                ]

            },
            {
                path : "vendor-panel",
                element : <Vendorpanel/>,

                children : [
                    {
                        path : "vendor-products",
                        element : <VendorProducts/>
                    },
                    {
                        path : "sponser-add",
                        element : <SponserAdd/>
                    },
                    {
                        path : "banner-req",
                        element : <BannerRequest/>
                    },
                    {
                        path : 'my-profile',
                        element : <MyProfile/>
                    },
                    {
                        path : 'rating',
                        element : <RatingView/>
                    },
                    {
                        path : 'vendor-report',
                        element : <VendorReport/>
                    },
                    {
                        path : 'portfolio',
                        element : <Portfolio/>
                    },
                    {
                        path : 'vendor-order',
                        element : <VendorOrders/>
                    },
                    {
                        path : 'guest-management',
                        element : <GuestManagement/>
                    },
                ]


            },
            {
            path:"user-panel",
            element:<UserPanel/>,

            children:[
                {
                    path : 'orders',
                    element : <MyOrders/>
                },
                {
                    path : 'my-profile',
                    element : <MyProfile/>
                },
                {
                    path : 'my-events',
                    element : <MyEvents/>
                },
               
            ]

            }



        ]
    }
])

export default router
