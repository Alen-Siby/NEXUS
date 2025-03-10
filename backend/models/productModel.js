const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true
    },
    courseType: {
        type: String,
        required: true
    },
    dishes: [{
        type: String,
        required: true
    }],
    additionalNotes: {
        type: String,
        default: ''
    }
});

const cateringSchema = new mongoose.Schema({
    courseType: {
        type: String,
        enum: ['3', '5', '7', '10'],
        required: true
    },
    courses: [courseSchema]
});

const rentalVariantSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'At least one image is required for each variant'
        }
    }
});

const bakeryVariantSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    servingCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'At least one image is required for each bakery item'
        }
    }
});

const productSchema = mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    brandName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    productImage: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: function() {
            return this.category !== 'rent'; // Price is not required for rent category
        }
    },
    user: {
        type: String,
        required: true
    },
    disabled: { 
        type: Boolean, 
        default: false 
    },
    sponsor: {
        type: Boolean, 
        default: false 
    },
    catering: {
        type: cateringSchema,
        required: function() {
            return this.category === 'Catering';
        }
    },
    rentalVariants: {
        type: [rentalVariantSchema],
        required: function() {
            return this.category === 'rent';
        },
        validate: {
            validator: function(v) {
                return this.category !== 'rent' || (Array.isArray(v) && v.length > 0);
            },
            message: 'At least one variant is required for rental products'
        }
    },
    bakeryVariants: {
        type: [bakeryVariantSchema],
        required: function() {
            return this.category?.toLowerCase() === 'bakers';
        },
        validate: {
            validator: function(v) {
                return this.category?.toLowerCase() !== 'bakers' || (Array.isArray(v) && v.length > 0);
            },
            message: 'At least one bakery item is required for bakery products'
        }
    }
}, {
    timestamps: true
});

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;
