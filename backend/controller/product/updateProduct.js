const uploadProductPermission = require('../../helpers/permission')
const productModel = require('../../models/productModel')

async function updateProductController(req, res) {
    try {
        if (!uploadProductPermission(req.userId)) {
            throw new Error("Permission denied")
        }

        const { _id, ...updateData } = req.body;

        // Validate catering data if present
        if (updateData.category?.toLowerCase() === "catering" && updateData.catering) {
            // Validate course type
            const validCourseTypes = ['3', '5', '7', '10'];
            if (!validCourseTypes.includes(updateData.catering.courseType)) {
                throw new Error("Invalid course type selected");
            }

            // Validate courses data
            if (!Array.isArray(updateData.catering.courses) || 
                updateData.catering.courses.length !== parseInt(updateData.catering.courseType)) {
                throw new Error(`Expected ${updateData.catering.courseType} courses but received ${updateData.catering.courses?.length || 0}`);
            }

            // Validate each course has required fields and proper structure
            updateData.catering.courses.forEach((course, index) => {
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

        // Validate rental data if present
        if (updateData.category?.toLowerCase() === "rent" && updateData.rentalVariants) {
            console.log('Processing rental variants update:', updateData.rentalVariants);
            
            if (!Array.isArray(updateData.rentalVariants)) {
                throw new Error("Rental variants must be an array");
            }

            // Validate each variant
            updateData.rentalVariants.forEach((variant, index) => {
                if (!variant.itemName) {
                    throw new Error(`Item name is required for variant ${index + 1}`);
                }
                if (!variant.stock || variant.stock < 0) {
                    throw new Error(`Valid stock quantity is required for ${variant.itemName}`);
                }
                if (!variant.price || variant.price < 0) {
                    throw new Error(`Valid price is required for ${variant.itemName}`);
                }
            });

            // Remove the main price field for rental products
            delete updateData.price;
        }

        console.log('Updating product with data:', updateData); // Debug log

        const updateProduct = await productModel.findByIdAndUpdate(
            _id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updateProduct) {
            throw new Error("Product not found");
        }

        console.log('Updated product:', updateProduct); // Debug log

        res.json({
            message: "Product updated successfully",
            data: updateProduct,
            success: true,
            error: false
        });

    } catch (err) {
        console.error('Update Product Error:', err); // Debug log
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = updateProductController;