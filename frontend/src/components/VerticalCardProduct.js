import React, { useContext, useEffect, useRef, useState } from 'react'
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct'
import displayINRCurrency from '../helpers/displayCurrency'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import addToCart from '../helpers/addToCart'
import Context from '../context'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import SummaryApi from '../common'

const VerticalCardProduct = ({ category, heading }) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const loadingList = new Array(13).fill(null)
    const [ratings, setRatings] = useState({})

    const scrollElement = useRef()

    const { fetchUserAddToCart } = useContext(Context)

    // Define quantity state
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = async (e, id) => {
        await addToCart(e, id, quantity) // Use the quantity state
        fetchUserAddToCart()
    }

    const fetchData = async () => {
        setLoading(true)
        const categoryProduct = await fetchCategoryWiseProduct(category)
        setLoading(false)

        // console.log("horizontal data", categoryProduct.data)
        setData(categoryProduct?.data)
    }

    useEffect(() => {
        fetchData()
        fetchRatings()
    }, [])

    const fetchRatings = async () => {
        try {
            const response = await fetch(SummaryApi.getRating.url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch ratings');
            }

            const data = await response.json();
            if (Array.isArray(data?.data)) {
                // Convert array to object with productId as key
                const ratingsMap = data.data.reduce((acc, rating) => {
                    if (!acc[rating.productId]) {
                        acc[rating.productId] = {
                            avgRating: 0,
                            totalRatings: 0,
                            totalReviews: 0
                        };
                    }
                    acc[rating.productId].totalRatings++;
                    acc[rating.productId].avgRating = 
                        (acc[rating.productId].avgRating * (acc[rating.productId].totalRatings - 1) + rating.rating) 
                        / acc[rating.productId].totalRatings;
                    if (rating.review) {
                        acc[rating.productId].totalReviews++;
                    }
                    return acc;
                }, {});
                setRatings(ratingsMap);
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    const scrollRight = () => {
        scrollElement.current.scrollTo({
            left: scrollElement.current.scrollLeft + 300,
            behavior: 'smooth' // Smooth scrolling
        });
    }
    
    const scrollLeft = () => {
        scrollElement.current.scrollTo({
            left: scrollElement.current.scrollLeft - 300,
            behavior: 'smooth' // Smooth scrolling
        });
    }

    const RatingStars = ({ rating }) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                        key={star}
                        className={`${
                            star <= rating 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                        } text-sm`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const getProductTag = (productId, ratings) => {
        const rating = ratings[productId];
        if (!rating) return null;

        if (rating.avgRating >= 4.5 && rating.totalRatings >= 50) {
            return {
                text: "Popular Choice",
                className: "bg-orange-500/90",
                icon: (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                )
            };
        } else if (rating.avgRating >= 4.2 && rating.totalRatings >= 30) {
            return {
                text: "Nexus Recommended",
                className: "bg-blue-500/90",
                icon: (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )
            };
        } else if (rating.avgRating >= 4.0 && rating.totalRatings >= 20) {
            return {
                text: "Top Rated",
                className: "bg-green-500/90",
                icon: (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                )
            };
        }
        return null;
    };

    // Function to get price range for rental items
    const getRentalPriceRange = (product) => {
        if (!product.rentalVariants || product.rentalVariants.length === 0) {
            return product.price ? `₹${product.price}` : "Price not available";
        }

        const prices = product.rentalVariants.map(item => item.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
            return `₹${minPrice}`;
        }

        return `₹${minPrice} - ₹${maxPrice}`;
    };

    // Function to get price range for bakery items
    const getBakeryPriceRange = (product) => {
        if (!product.bakeryVariants || product.bakeryVariants.length === 0) {
            return product.price ? `₹${product.price}` : "Price not available";
        }

        const prices = product.bakeryVariants.map(item => item.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
            return `₹${minPrice}`;
        }

        return `₹${minPrice} - ₹${maxPrice}`;
    };

    return (
        <div className="px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{heading}</h2>
            
            {/* Added relative container for absolute positioning of arrows */}
            <div className="relative">
                {/* Left Arrow */}
                <button
                    onClick={() => {
                        const container = document.getElementById(`scroll-${category}`);
                        container.scrollLeft -= container.offsetWidth - 100;
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                        p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 
                        hover:border-gray-300 transition-all duration-200 flex items-center justify-center
                        shadow-md hover:shadow-lg"
                    aria-label="Scroll left"
                >
                    <IoIosArrowBack className="w-6 h-6 text-gray-600" />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={() => {
                        const container = document.getElementById(`scroll-${category}`);
                        container.scrollLeft += container.offsetWidth - 100;
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                        p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 
                        hover:border-gray-300 transition-all duration-200 flex items-center justify-center
                        shadow-md hover:shadow-lg"
                    aria-label="Scroll right"
                >
                    <IoIosArrowForward className="w-6 h-6 text-gray-600" />
                </button>

                {/* Scrollable container */}
                <div 
                    id={`scroll-${category}`}
                    className="flex overflow-x-auto gap-4 scroll-smooth scrollbar-hide px-4"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {data.map((product) => (
                        <div 
                            key={product._id}
                            className="flex-none w-[280px] group bg-white rounded-xl overflow-hidden border 
                                border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all 
                                duration-300 relative"
                        >
                            {/* Image Container */}
                            <Link to={`/product/${product._id}`} className="block">
                                <div className="relative h-[200px] overflow-hidden">
                                    <img
                                        src={product.productImage?.[0] || 'https://via.placeholder.com/150'}
                                        alt={product.productName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/150';
                                        }}
                                    />
                                    {/* Product Tag */}
                                    {getProductTag(product._id, ratings) && (
                                        <span 
                                            className={`
                                                absolute top-2 right-2
                                                ${getProductTag(product._id, ratings).className} 
                                                text-white px-2 py-1 rounded-full text-xs font-medium 
                                                backdrop-blur-sm flex items-center gap-1
                                            `}
                                        >
                                            {getProductTag(product._id, ratings).icon}
                                            {getProductTag(product._id, ratings).text}
                                        </span>
                                    )}
                                </div>
                            </Link>

                            {/* Content Container */}
                            <div className="p-4">
                                <Link to={`/product/${product._id}`} className="block">
                                    <div className="space-y-2">
                                        {/* Product Name and Stars Row */}
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-medium text-gray-800 group-hover:text-blue-600 
                                                transition-colors duration-200 truncate flex-1">
                                                {product.productName}
                                            </h3>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span 
                                                            key={star}
                                                            className={`${
                                                                star <= (ratings[product._id]?.avgRating || 0)
                                                                    ? 'text-yellow-400' 
                                                                    : 'text-gray-300'
                                                            } text-xs`}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="text-[11px] text-gray-500 mt-0.5 whitespace-nowrap">
                                                    {ratings[product._id]?.totalRatings || 0} Ratings • {ratings[product._id]?.totalReviews || 0} Reviews
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Brand Name */}
                                        <p className="text-xs text-gray-600 truncate">{product.brandName}</p>
                                        
                                        {/* Price and View Arrow */}
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-semibold text-green-600">
                                                {product.category.toLowerCase() === 'rent' 
                                                    ? getRentalPriceRange(product)
                                                    : product.category.toLowerCase() === 'bakers'
                                                        ? getBakeryPriceRange(product)
                                                        : `₹${product.price}`
                                                }
                                            </p>
                                            <span className="text-blue-600 opacity-0 group-hover:opacity-100 
                                                transition-opacity duration-200 text-xs">
                                                View →
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Add to Cart Button */}
                                <div className="mt-4">
                                    <button
                                        onClick={(e) => handleAddToCart(e, product._id)}
                                        className="w-full bg-blue-600 text-white text-sm py-2 px-4 rounded-lg
                                            hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        <svg 
                                            className="w-4 h-4" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth="2" 
                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hide scrollbar */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}

export default VerticalCardProduct
