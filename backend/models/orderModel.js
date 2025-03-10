const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: String,
    courseType: String,
    menuItems: [String],
    additionalNotes: String,
    dietaryRestrictions: [String]
});

const cateringDetailsSchema = new mongoose.Schema({
    courses: [courseSchema]
});

const rentalDetailsSchema = new mongoose.Schema({
    variantName: String,
    variantPrice: Number,
    startDate: Date,
    endDate: Date,
    totalPrice: Number,
    fine: {
        type: Number,
        default: 0
    },
    isReturned: {
        type: Boolean,
        default: false
    },
    finePerDay: {
        type: Number,
    },
    variantImage: String
});

const bakeryVariantSchema = new mongoose.Schema({
    variantId: String,
    itemName: String,
    quantity: Number,
    price: Number,
    image: String
});

const bakeryDetailsSchema = new mongoose.Schema({
    configuration: [bakeryVariantSchema],
    totalPrice: Number
});

const additionalDetailsSchema = new mongoose.Schema({
    catering: cateringDetailsSchema,
    rental: rentalDetailsSchema,
    bakery: bakeryDetailsSchema
});

const productSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    vendor: String,
    vendorName: String,
    additionalDetails: additionalDetailsSchema
});

const orderSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    products: [productSchema],
    totalPrice: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Ordered', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    paymentId: String,
    invoiceNumber: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);