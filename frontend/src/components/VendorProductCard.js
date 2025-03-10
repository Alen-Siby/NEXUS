import React, { useState, useEffect } from 'react';
import { MdModeEditOutline, MdDelete } from 'react-icons/md';
import VendorEditProduct from './VendorEditProduct';
import displayINRCurrency from '../helpers/displayCurrency';
import { toast } from 'react-toastify'; // Import toast for notifications
import SummaryApi from '../common/index';
import { FaRecycle } from "react-icons/fa";
import { useTheme } from '../context/ThemeContext';

const VendorProductCard = ({ data, fetchdata }) => {
  const [editProduct, setEditProduct] = useState(false);
  const [isDisabled, setIsDisabled] = useState(data.disabled); // Track disabled state
  const { isDarkMode } = useTheme();

  const handleDisable = async () => {
    if (!window.confirm('Are you sure you want to disable this product?')) return;
  
    try {
      const response = await fetch(`${SummaryApi.disableProduct.url}/${data._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Log the response for debugging
      const responseData = await response.json();
      console.log('Disable Product Response:', responseData);
  
      if (response.ok) {
        toast.success('Product disabled successfully!');
        setIsDisabled(true); // Mark product as disabled
        fetchdata(); // Refresh the product list
      } else {
        throw new Error(responseData.message || 'Failed to disable product');
      }
    } catch (error) {
      console.error('Error disabling product:', error);
      toast.error(error.message || 'Failed to disable product');
    }
  };
  

  const handleEnable = async () => {
    if (!window.confirm('Are you sure you want to enable this product?')) return;

    try {
      const response = await fetch(`${SummaryApi.enableProduct.url}/${data._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Product enabled successfully!');
        setIsDisabled(false); // Mark product as enabled
        fetchdata(); // Refresh the product list
      } else {
        throw new Error('Failed to enable product');
      }
    } catch (error) {
      console.error('Error enabling product:', error);
      toast.error('Failed to enable product');
    }
  };

  // Function to get price range for rental items
  const getRentalPriceRange = () => {
    if (!data.rentalVariants || data.rentalVariants.length === 0) {
      return "Price not available";
    }

    const prices = data.rentalVariants.map(item => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return displayINRCurrency(minPrice);
    }

    return `${displayINRCurrency(minPrice)} - ${displayINRCurrency(maxPrice)}`;
  };

  // Function to get price range for bakery items
  const getBakeryPriceRange = () => {
    if (!data.bakeryVariants || data.bakeryVariants.length === 0) {
      return "Price not available";
    }

    const prices = data.bakeryVariants.map(item => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return displayINRCurrency(minPrice);
    }

    return `${displayINRCurrency(minPrice)} - ${displayINRCurrency(maxPrice)}`;
  };

  return (
    <div className={`
      ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}
      w-[220px] h-[260px] // Reduced width from 240px to 220px
      rounded-lg shadow-md
      p-2.5 // Slightly reduced padding
      ${isDisabled ? 'opacity-50' : ''}
      flex flex-col
      m-2 // Reduced margin for tighter spacing
    `}>
      {/* Image Container */}
      <div className='w-full h-32 mb-2'> {/* Reduced height from 36 to 32 */}
        <img 
          src={data?.productImage[0]} 
          className='w-full h-full object-cover rounded-md'
          alt={data.productName} 
        />
      </div>

      {/* Product Details */}
      <div className='flex-1 flex flex-col'>
        <h2 className='text-sm font-semibold mb-1 line-clamp-2'> {/* Slightly reduced text size */}
          {data.productName}
        </h2>

        {/* Price Display - Conditional based on category */}
        <p className='font-bold mb-1.5 text-sm'>
          {data.category.toLowerCase() === 'rent' 
            ? getRentalPriceRange()
            : data.category.toLowerCase() === 'bakers'
              ? getBakeryPriceRange()
              : displayINRCurrency(data.price)
          }
        </p>

        {/* Action Buttons */}
        <div className='flex items-center gap-2 mt-auto'>
          <div
            className={`p-1.5 ${isDarkMode ? 'bg-green-900 hover:bg-green-700' : 'bg-green-100 hover:bg-green-600'} 
            rounded-full hover:text-white cursor-pointer ${isDisabled ? 'pointer-events-none' : ''}`}
            onClick={() => !isDisabled && setEditProduct(true)}
          >
            <MdModeEditOutline className={`${isDarkMode ? 'text-green-400' : ''} w-4 h-4`} />
          </div>

          {isDisabled ? (
            <div
              className={`p-1.5 ${isDarkMode ? 'bg-blue-900 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-600'} 
              rounded-full hover:text-white cursor-pointer`}
              onClick={handleEnable}
            >
              <FaRecycle className={`${isDarkMode ? 'text-blue-400' : ''} w-4 h-4`} />
            </div>
          ) : (
            <div
              className={`p-1.5 ${isDarkMode ? 'bg-red-900 hover:bg-red-700' : 'bg-red-100 hover:bg-red-600'} 
              rounded-full hover:text-white cursor-pointer`}
              onClick={handleDisable}
            >
              <MdDelete className={`${isDarkMode ? 'text-red-400' : ''} w-4 h-4`} />
            </div>
          )}
        </div>
      </div>

      {editProduct && !isDisabled && (
        <VendorEditProduct 
          productData={data} 
          onClose={() => setEditProduct(false)} 
          fetchdata={fetchdata}
        />
      )}
    </div>
  );
};

export default VendorProductCard;
