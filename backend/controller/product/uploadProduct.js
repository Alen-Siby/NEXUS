const uploadProductPermission = require("../../helpers/permission")
const productModel = require("../../models/productModel")

async function UploadProductController(req, res) {
    try {
        const sessionUserId = req.userId

        if (!uploadProductPermission(sessionUserId)) {
            throw new Error("Permission denied")
        }

        // Extract data from request body
        const productData = {
            ...req.body
        };

        console.log('Received Data:', productData);

        // If it's a catering product, validate and structure the catering data
        if (productData.category === "Catering" && productData.catering) {
            // Validate course type
            const validCourseTypes = ['3', '5', '7', '10'];
            if (!validCourseTypes.includes(productData.catering.courseType)) {
                throw new Error("Invalid course type selected");
            }

            // Validate courses data
            if (!Array.isArray(productData.catering.courses) || 
                productData.catering.courses.length !== parseInt(productData.catering.courseType)) {
                throw new Error(`Expected ${productData.catering.courseType} courses but received ${productData.catering.courses?.length || 0}`);
            }

            // Validate each course has required fields and proper structure
            productData.catering.courses.forEach((course, index) => {
                // Check required fields
                if (!course.courseName) {
                    throw new Error(`Course name is required for course ${index + 1}`);
                }
                if (!course.courseType) {
                    throw new Error(`Course type is required for course ${index + 1}`);
                }
                if (!Array.isArray(course.dishes)) {
                    throw new Error(`Dishes must be an array for course ${index + 1}`);
                }
                if (course.dishes.length === 0) {
                    throw new Error(`At least one dish is required for course ${index + 1}`);
                }

                // Validate each dish
                course.dishes.forEach((dish, dishIndex) => {
                    if (!dish || typeof dish !== 'string' || dish.trim().length === 0) {
                        throw new Error(`Invalid dish at position ${dishIndex + 1} in course ${index + 1}`);
                    }
                });

                // Validate additional notes if present
                if (course.additionalNotes && typeof course.additionalNotes !== 'string') {
                    throw new Error(`Additional notes must be text for course ${index + 1}`);
                }
            });
        }

        // If it's a rental product, validate and structure the rental data
        if (productData.category === "rent" && productData.rentalVariants) {
            console.log('Processing rental variants:', productData.rentalVariants);
            
            // Validate rental variants
            if (!Array.isArray(productData.rentalVariants)) {
                throw new Error("Rental variants must be an array");
            }

            // Validate each variant
            productData.rentalVariants.forEach((variant, index) => {
                if (!variant.itemName) {
                    throw new Error(`Item name is required for variant ${index + 1}`);
                }
                if (!variant.stock || variant.stock < 0) {
                    throw new Error(`Valid stock quantity is required for ${variant.itemName}`);
                }
                if (!variant.price || variant.price < 0) {
                    throw new Error(`Valid price is required for ${variant.itemName}`);
                }
                // Validate images
                if (!Array.isArray(variant.images)) {
                    throw new Error(`Images must be an array for variant ${variant.itemName}`);
                }
                if (variant.images.length === 0) {
                    throw new Error(`At least one image is required for variant ${variant.itemName}`);
                }
                variant.images.forEach((image, imageIndex) => {
                    if (!image || typeof image !== 'string') {
                        throw new Error(`Invalid image URL at position ${imageIndex + 1} for variant ${variant.itemName}`);
                    }
                });
            });

            // For rental products, we'll use the first variant's first image as the main product image
            productData.productImage = productData.rentalVariants[0].images;
            
            // Remove any standalone price for rental products
            delete productData.price;
        }

        // If it's a bakery product, validate and structure the bakery data
        if (productData.category.toLowerCase() === "bakers" && productData.bakeryVariants) {
            console.log('Processing bakery variants:', productData.bakeryVariants);
            
            // Validate bakery variants
            if (!Array.isArray(productData.bakeryVariants)) {
                throw new Error("Bakery variants must be an array");
            }

            // Validate each variant
            productData.bakeryVariants.forEach((variant, index) => {
                if (!variant.itemName) {
                    throw new Error(`Item name is required for bakery item ${index + 1}`);
                }
                if (!variant.servingCapacity || variant.servingCapacity < 1) {
                    throw new Error(`Valid serving capacity is required for ${variant.itemName}`);
                }
                
                // Validate images
                if (!Array.isArray(variant.images)) {
                    throw new Error(`Images must be an array for bakery item ${variant.itemName}`);
                }
                if (variant.images.length === 0) {
                    throw new Error(`At least one image is required for bakery item ${variant.itemName}`);
                }
                variant.images.forEach((image, imageIndex) => {
                    if (!image || typeof image !== 'string') {
                        throw new Error(`Invalid image URL at position ${imageIndex + 1} for bakery item ${variant.itemName}`);
                    }
                });
            });

            // For bakery products, use the first variant's first image as the main product image
            productData.productImage = productData.bakeryVariants[0].images;
        }

        console.log('Saving product with data:', productData);

        const uploadProduct = new productModel(productData)
        const saveProduct = await uploadProduct.save()

        res.status(201).json({
            message: "Product uploaded successfully",
            error: false,
            success: true,
            data: saveProduct
        })

    } catch (err) {
        console.error('Upload Product Error:', err);
        res.status(400).json({
            message: err.message || "Error uploading product",
            error: true,
            success: false
        })
    }
}

module.exports = UploadProductController