const mongoose = require('mongoose')

const addToCart = mongoose.Schema({
   productId : {
        ref : 'product',
        type : String,
   },
   quantity : Number,
   userId : String,
   configuration: {
        type: Object,  // For catering configurations
        default: null
   },
   rentalVariant: {
        type: {
            variantId: String,
            variantName: String,
            variantPrice: Number
        },
        default: null
   },
   bakeryVariant: {
        type: {
            variantId: String,
            variantName: String,
            variantPrice: Number,
            configuration: Object,
            servingCapacity: Number
        },
        default: null
   }
},{
    timestamps : true
})

const addToCartModel = mongoose.model("addToCart", addToCart)

module.exports = addToCartModel