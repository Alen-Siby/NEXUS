import React, { useState,useEffect } from 'react'
import { CgClose } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import SummaryApi from '../common';
import {toast} from 'react-toastify'
import uploadImage from '../helpers/uploadImage';
import productCategory from '../helpers/productCategory';
import DisplayImage from './DisplayImage';



const AdminEditProduct = ({
  onClose,
  productData,
  fetchdata
 
}) => {

  const [data,setData] = useState({
    ...productData,
    productName : productData?.productName,
    brandName : productData?.brandName,
    category : productData?.category,
    description : productData?.description,
    price : productData?.price,
    user: productData?.user,
    ...(productData?.category?.toLowerCase() !== 'rent' && 
        productData?.category?.toLowerCase() !== 'bakers' && {
      productImage: productData?.productImage || []
    })
  })
  const [openFullScreenImage,setOpenFullScreenImage] = useState(false)
  const [fullScreenImage,setFullScreenImage] = useState("")
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [courseType, setCourseType] = useState(productData?.catering?.courseType || '');
  const [newDishes, setNewDishes] = useState({});
  const [courseDishes, setCourseDishes] = useState(
    productData?.catering?.courses?.reduce((acc, course) => ({
      ...acc,
      [course.courseType]: course.dishes || []
    }), {}) || {}
  );
  const [cateringCourses, setCateringCourses] = useState(
    productData?.catering?.courses?.reduce((acc, course) => ({
      ...acc,
      [course.courseType]: course.additionalNotes || ''
    }), {}) || {}
  );

  // Initialize rentalVariants with proper check
  const [rentalVariants, setRentalVariants] = useState(() => {
    // Check if productData has rentalVariants and it's not empty
    if (productData?.rentalVariants && productData.rentalVariants.length > 0) {
      return productData.rentalVariants;
    }
    // Return default variant if no existing variants
    return [{ itemName: '', stock: '', price: '', images: [] }];
  });

  // Initialize bakeryVariants with proper check
  const [bakeryVariants, setBakeryVariants] = useState(() => {
    if (productData?.bakeryVariants && productData.bakeryVariants.length > 0) {
      return productData.bakeryVariants;
    }
    return [{ itemName: '', servingCapacity: '', price: '', images: [] }];
  });

  useEffect(() => {
    const fetchData = async () => {
     
      await fetchCategoryProduct(); // Fetch categories on component mount
    };
    fetchData();
  }, []);

  const handleOnChange = (e)=>{
      const { name, value} = e.target

      setData((preve)=>{
        return{
          ...preve,
          [name]  : value
        }
      })
  }

  const handleUploadProduct = async(e) => {
    const file = e.target.files[0]
    const uploadImageCloudinary = await uploadImage(file)

    setData((preve)=>{
      return{
        ...preve,
        productImage : [ ...preve.productImage, uploadImageCloudinary.url]
      }
    })
  }

  const handleDeleteProductImage = async(index)=>{
    console.log("image index",index)
    
    const newProductImage = [...data.productImage]
    newProductImage.splice(index,1)

    setData((preve)=>{
      return{
        ...preve,
        productImage : [...newProductImage]
      }
    })
    
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    const cateringData = data.category.toLowerCase() === "catering" ? {
      courseType: courseType,
      courses: getCourseFields().map(course => ({
        courseName: course.label,
        courseType: course.name,
        dishes: courseDishes[course.name] || [],
        additionalNotes: cateringCourses[course.name] || ''
      }))
    } : null;

    const finalData = {
      ...data,
      _id: productData._id,
      ...(data.category.toLowerCase() === "catering" && {
        catering: cateringData
      }),
      ...(data.category.toLowerCase() === "rent" && {
        rentalVariants: rentalVariants
      }),
      ...(data.category.toLowerCase() === "bakers" && {
        bakeryVariants: bakeryVariants
      })
    };

    console.log('Submitting data:', finalData);

    try {
      const response = await fetch(SummaryApi.updateProduct.url, {
        method: SummaryApi.updateProduct.method,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(finalData)
      });

      const responseData = await response.json();
      console.log('Server Response:', responseData);

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        await fetchdata();
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error("An error occurred while updating the product");
    }
  };

  const fetchCategoryProduct = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(SummaryApi.categoryPro.url, {
        method: 'GET',
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const dataResponse = await response.json();
      console.log('Response status:', response.status);
      console.log('Categories fetched:', dataResponse.data);

      // Filter only enabled categories (disabled: false)
      const enabledCategories = dataResponse.data.filter(category => category.disabled === false);
      setCategories(enabledCategories);

      if (dataResponse.success) {
        console.log('Enabled categories:', enabledCategories);
      }
      //  else {
      //   toast.error("Failed to fetch categories.");
      // }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("An error occurred while fetching categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Initialize data with all required fields
  useEffect(() => {
    if (productData) {
      setData({
        _id: productData._id,
        productName: productData.productName || "",
        brandName: productData.brandName || "",
        category: productData.category || "",
        productImage: productData.productImage || [],
        description: productData.description || "",
        price: productData.price || "",
        user: productData.user || ""
      });
    }
  }, [productData]);

  // Initialize states when course type changes
  useEffect(() => {
    if (courseType) {
      const initialNewDishes = {};
      getCourseFields().forEach(course => {
        if (!courseDishes[course.name]) {
          courseDishes[course.name] = [];
        }
        initialNewDishes[course.name] = '';
      });
      setNewDishes(initialNewDishes);
    }
  }, [courseType]);

  // Course fields definition
  const getCourseFields = () => {
    const allCourses = [
      {
        name: "horsOeuvre",
        label: "Appetizer",
        description: "(Starter)"
      },
      {
        name: "mainCourse",
        label: "Main Course",
        description: "(Entrée)"
      },
      {
        name: "dessert",
        label: "Dessert",
        description: "(Sweet)"
      },
      {
        name: "soup",
        label: "Soup",
        description: "(Broth-based)"
      },
      {
        name: "salad",
        label: "Salad",
        description: "(Fresh greens)"
      },
      {
        name: "fishCourse",
        label: "Fish Course",
        description: "(Seafood)"
      },
      {
        name: "palateCleaner",
        label: "Palate Cleanser",
        description: "(Sorbet)"
      },
      {
        name: "amuseBouche",
        label: "Amuse-Bouche",
        description: "(Pre-appetizer)"
      },
      {
        name: "cheeseCourse",
        label: "Cheese Course",
        description: "(Cheese selection)"
      },
      {
        name: "coffeeMignardises",
        label: "Coffee & Mignardises",
        description: "(With pastries)"
      }
    ];

    return allCourses.slice(0, parseInt(courseType));
  };

  // Handle input change for specific course
  const handleNewDishChange = (courseName, value) => {
    setNewDishes(prev => ({
      ...prev,
      [courseName]: value
    }));
  };

  // Handle adding a new dish
  const handleAddDish = (courseName) => {
    const dishValue = newDishes[courseName];
    if (dishValue?.trim()) {
      setCourseDishes(prev => ({
        ...prev,
        [courseName]: [...(prev[courseName] || []), dishValue.trim()]
      }));
      setNewDishes(prev => ({
        ...prev,
        [courseName]: ''
      }));
    }
  };

  // Handle removing a dish
  const handleRemoveDish = (courseName, dishIndex) => {
    setCourseDishes(prev => ({
      ...prev,
      [courseName]: prev[courseName].filter((_, index) => index !== dishIndex)
    }));
  };

  // Handle key press
  const handleKeyPress = (e, courseName) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDish(courseName);
    }
  };

  // Handle course type change
  const handleCourseTypeChange = (e) => {
    setCourseType(e.target.value);
  };

  // Handle catering notes change
  const handleCateringChange = (e) => {
    const { name, value } = e.target;
    setCateringCourses(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle variant changes
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...rentalVariants];
    newVariants[index][field] = value;
    setRentalVariants(newVariants);
  };

  // Handle multiple variant image upload
  const handleVariantImageUpload = async (e, variantIndex) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const loadingToast = toast.loading(`Uploading ${files.length} images...`);
      const uploadPromises = files.map(file => uploadImage(file));
      const uploadedImages = await Promise.all(uploadPromises);

      setRentalVariants(prev => {
        const newVariants = [...prev];
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          images: [
            ...newVariants[variantIndex].images,
            ...uploadedImages.map(result => result.url)
          ]
        };
        return newVariants;
      });

      toast.update(loadingToast, {
        render: `Successfully uploaded ${files.length} images`,
        type: "success",
        isLoading: false,
        autoClose: 2000
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload some images');
    }
  };

  // Handle variant image deletion
  const handleDeleteVariantImage = (variantIndex, imageIndex) => {
    setRentalVariants(prev => {
      const newVariants = [...prev];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        images: newVariants[variantIndex].images.filter((_, i) => i !== imageIndex)
      };
      return newVariants;
    });
  };

  // Add new variant
  const addNewVariant = () => {
    setRentalVariants([...rentalVariants, { itemName: '', stock: '', price: '', images: [] }]);
  };

  // Remove variant with safety check
  const removeVariant = (index) => {
    if (!rentalVariants || rentalVariants.length <= 1) {
      toast.error('At least one variant is required');
      return;
    }
    setRentalVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Handle bakery variant changes
  const handleBakeryVariantChange = (index, field, value) => {
    const newVariants = [...bakeryVariants];
    newVariants[index][field] = value;
    setBakeryVariants(newVariants);
  };

  // Add new bakery variant
  const addNewBakeryVariant = () => {
    setBakeryVariants([...bakeryVariants, { itemName: '', servingCapacity: '', price: '', images: [] }]);
  };

  // Remove bakery variant
  const removeBakeryVariant = (index) => {
    if (bakeryVariants.length <= 1) {
      toast.error('At least one bakery item is required');
      return;
    }
    setBakeryVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Handle bakery variant image upload
  const handleBakeryVariantImageUpload = async (e, variantIndex) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const uploadImageCloudinary = await uploadImage(file);
        setBakeryVariants(prev => {
          const newVariants = [...prev];
          newVariants[variantIndex] = {
            ...newVariants[variantIndex],
            images: [...newVariants[variantIndex].images, uploadImageCloudinary.url]
          };
          return newVariants;
        });
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error('Failed to upload image');
      }
    }
  };

  // Handle bakery variant image deletion
  const handleDeleteBakeryVariantImage = (variantIndex, imageIndex) => {
    setBakeryVariants(prev => {
      const newVariants = [...prev];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        images: newVariants[variantIndex].images.filter((_, i) => i !== imageIndex)
      };
      return newVariants;
    });
  };

  return (
    <div className='fixed w-full h-full bg-black bg-opacity-50 top-0 left-0 right-0 bottom-0 flex justify-center items-center z-[9999]'>
      <div className='bg-white p-4 rounded-lg w-full max-w-xl h-full max-h-[80%] overflow-hidden relative shadow-2xl'>
        {/* Header */}
        <div className='flex justify-between items-center pb-3 border-b'>
          <h2 className='font-bold text-xl text-gray-800'>Edit Product</h2>
          <button 
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors' 
            onClick={onClose}
          >
            <CgClose className="text-2xl text-gray-600 hover:text-red-600" />
          </button>
        </div>

        {/* Form Container with Padding Bottom for Button */}
        <div className='h-[calc(100%-4rem)] overflow-y-auto'>
          <form id="editProductForm" className='grid gap-6 p-4 pb-24' onSubmit={handleSubmit}>
            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label htmlFor='productName' className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type='text'
                  id='productName'
                  placeholder='Enter product/package/service name'
                  name='productName'
                  value={data.productName}
                  onChange={handleOnChange}
                  className='w-full p-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                  required
                />
              </div>

              <div>
                <label htmlFor='brandName' className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type='text'
                  id='brandName'
                  placeholder='Enter company name'
                  value={data.brandName}
                  name='brandName'
                  onChange={handleOnChange}
                  className='w-full p-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                  required
                />
              </div>

              <div>
                <label htmlFor='category' className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  required
                  value={data.category}
                  name='category'
                  onChange={handleOnChange}
                  className='w-full p-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                >
                  <option value="" disabled>Select Category</option>
                  {loadingCategories ? (
                    <option>Loading categories...</option>
                  ) : (
                    categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category._id} value={category.category}>
                          {category.label}
                        </option>
                      ))
                    ) : (
                      <option>No categories available</option>
                    )
                  )}
                </select>
              </div>

              {/* Image Upload Section */}
              {data.category.toLowerCase() !== "rent" && data.category.toLowerCase() !== "bakers" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                    <span className="text-xs text-gray-500 ml-2">
                      (You can select multiple images)
                    </span>
                  </label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center'>
                    <input 
                      type='file' 
                      id='uploadImageInput' 
                      className='hidden' 
                      accept='image/*'
                      multiple
                      onChange={handleUploadProduct}
                    />
                    <label htmlFor='uploadImageInput' className='cursor-pointer'>
                      <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                      <p className='text-sm text-gray-500'>Click to upload product images</p>
                    </label>
                  </div>
                  
                  {/* Image Preview */}
                  {data.productImage && data.productImage.length > 0 && (
                    <div className='grid grid-cols-4 gap-2 mt-2'>
                      {data.productImage.map((img, idx) => (
                        <div key={idx} className='relative group aspect-square'>
                          <img 
                            src={img} 
                            alt="" 
                            className='w-full h-full object-cover rounded-lg'
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteProductImage(idx)}
                            className='absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Only show price field if NOT bakers category */}
              {data.category && data.category.toLowerCase() !== "bakers" && (
                <div>
                  <label htmlFor='price' className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type='number'
                    id='price'
                    name='price'
                    value={data.price}
                    onChange={handleOnChange}
                    className='w-full p-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                    required={data.category.toLowerCase() !== "bakers"}
                  />
                </div>
              )}

              <div>
                <label htmlFor='description' className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  id='description'
                  placeholder='Enter product description'
                  name='description'
                  value={data.description}
                  onChange={handleOnChange}
                  rows={4}
                  className='w-full p-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none'
                />
              </div>
            </div>

            {/* Rental Variants Section */}
            {data.category.toLowerCase() === "rent" && rentalVariants && (
              <div className="space-y-4 mt-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Item Variants</h3>
                  <button
                    type="button"
                    onClick={addNewVariant}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span className="text-xl">+</span> Add Variant
                  </button>
                </div>

                {rentalVariants.map((variant, variantIndex) => (
                  <div key={variantIndex} className="p-4 bg-gray-50 rounded-lg space-y-4">
                    {/* Variant Details */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={variant.itemName}
                          onChange={(e) => handleVariantChange(variantIndex, 'itemName', e.target.value)}
                          placeholder="e.g., Plastic Chair, Wooden Chair"
                          className="p-2 bg-white border rounded w-full"
                          required
                        />
                      </div>
                      
                      <div className="w-24">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock
                        </label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(variantIndex, 'stock', e.target.value)}
                          placeholder="Qty"
                          className="p-2 bg-white border rounded w-full"
                          required
                          min="1"
                        />
                      </div>

                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(variantIndex, 'price', e.target.value)}
                          placeholder="Price"
                          className="p-2 bg-white border rounded w-full"
                          required
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Variant Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variant Images
                        <span className="text-xs text-gray-500 ml-2">
                          (You can select multiple images)
                        </span>
                      </label>
                      <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center'>
                        <input
                          type='file'
                          multiple
                          accept="image/*"
                          className='hidden'
                          id={`variant-images-${variantIndex}`}
                          onChange={(e) => handleVariantImageUpload(e, variantIndex)}
                        />
                        <label htmlFor={`variant-images-${variantIndex}`} className='cursor-pointer'>
                          <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                          <p className='text-sm text-gray-500'>
                            Upload Images for {variant.itemName || 'this variant'}
                          </p>
                        </label>
                      </div>

                      {/* Variant Images Preview */}
                      {variant.images && variant.images.length > 0 && (
                        <div className='mt-2'>
                          <div className='grid grid-cols-4 gap-2'>
                            {variant.images.map((image, imageIndex) => (
                              <div key={imageIndex} className='relative group aspect-square'>
                                <img
                                  src={image}
                                  alt={`${variant.itemName} - ${imageIndex + 1}`}
                                  className='w-full h-full object-cover rounded-lg'
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVariantImage(variantIndex, imageIndex)}
                                  className='absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                                >
                                  <MdDelete size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {/* Image Count */}
                          <p className="text-sm text-gray-500 mt-2">
                            {variant.images.length} image{variant.images.length !== 1 ? 's' : ''} uploaded
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Remove Variant Button */}
                    {rentalVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(variantIndex)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <MdDelete size={16} /> Remove Variant
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Conditional Catering Fields */}
            {data.category.toLowerCase() === "catering" && (
              <div className="space-y-6 border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800">Course Details</h3>
                
                {/* Course Type Selection */}
                <div className="space-y-3">
                  <p className="font-medium text-gray-700">Select Course Type:</p>
                  <div className="flex flex-wrap gap-6">
                    {['3', '5', '7', '10'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="courseType"
                          value={type}
                          checked={courseType === type}
                          onChange={handleCourseTypeChange}
                          className="w-4 h-4 text-red-600"
                        />
                        <span>{type} Course Meal</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Course Fields */}
                {courseType && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getCourseFields().map((course, index) => (
                      <div key={course.name} className="bg-white p-4 rounded-lg border">
                        {/* Course Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-7 h-7 flex items-center justify-center bg-red-100 text-red-600 rounded-full font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{course.label}</h4>
                            <p className="text-xs text-gray-500">{course.description}</p>
                          </div>
                        </div>

                        {/* Dish Input */}
                        <div className="relative mb-3">
                          <input
                            type="text"
                            placeholder={`Add a dish to ${course.label.toLowerCase()}`}
                            value={newDishes[course.name] || ''}
                            onChange={(e) => handleNewDishChange(course.name, e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, course.name)}
                            className="w-full pl-3 pr-12 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddDish(course.name)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Dishes List */}
                        <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
                          {courseDishes[course.name]?.map((dish, dishIndex) => (
                            <div 
                              key={dishIndex}
                              className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-md text-sm group"
                            >
                              <span className="text-gray-700">{dish}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDish(course.name, dishIndex)}
                                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Additional Notes */}
                        <textarea
                          name={course.name}
                          value={cateringCourses[course.name]}
                          onChange={handleCateringChange}
                          className="w-full p-2 bg-gray-50 border rounded-lg resize-none text-sm"
                          rows="2"
                          placeholder="Additional notes (optional)"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bakery Variants Section */}
            {data.category.toLowerCase() === "bakers" && (
              <div className="mt-6 space-y-6">
                <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Bakery Items</h3>
                {bakeryVariants.map((variant, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-xl space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm">
                          Item {index + 1}
                        </span>
                      </h4>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeBakeryVariant(index)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                        >
                          <MdDelete size={18} />
                          Remove Item
                        </button>
                      )}
                    </div>

                    {/* Three columns layout for inputs */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Chocolate Cake"
                          value={variant.itemName}
                          onChange={(e) => handleBakeryVariantChange(index, 'itemName', e.target.value)}
                          className="p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                            focus:ring-blue-500 focus:border-blue-500 block w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Serving Capacity</label>
                        <input
                          type="number"
                          placeholder="Number of pieces"
                          value={variant.servingCapacity}
                          onChange={(e) => handleBakeryVariantChange(index, 'servingCapacity', e.target.value)}
                          className="p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                            focus:ring-blue-500 focus:border-blue-500 block w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                        <input
                          type="number"
                          placeholder="Enter price"
                          value={variant.price}
                          onChange={(e) => handleBakeryVariantChange(index, 'price', e.target.value)}
                          className="p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                            focus:ring-blue-500 focus:border-blue-500 block w-full"
                        />
                      </div>
                    </div>

                    {/* Image upload section */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Item Images</label>
                      <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                          <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                              <span>Upload images</span>
                              <input
                                type="file"
                                className="sr-only"
                                onChange={(e) => handleBakeryVariantImageUpload(e, index)}
                                accept="image/*"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Image preview grid */}
                      {variant.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          {variant.images.map((image, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <img
                                src={image}
                                alt={`Bakery item ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteBakeryVariantImage(index, imgIndex)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full 
                                  opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MdDelete size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add new item button */}
                <button
                  type="button"
                  onClick={addNewBakeryVariant}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 
                    hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex items-center 
                    justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Another Bakery Item
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Fixed Update Button at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button 
            type="submit"
            form="editProductForm"
            className='w-full px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium'
          >
            Update Product
          </button>
        </div>
      </div>

      {/***display image full screen */}
      {
        openFullScreenImage && (
          <DisplayImage onClose={()=>setOpenFullScreenImage(false)} imgUrl={fullScreenImage}/>
        )
       }
        
    </div>
  )
}

export default AdminEditProduct