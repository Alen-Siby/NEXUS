const mongoose = require('mongoose')

const addToCart = mongoose.Schema({
   productId : {
        ref : 'product',
        type : String,
   },
   quantity : Number,
   userId : String,
   configuration: {
        type: Object,  // This will store the configuration object
        default: null  // Default to null for non-catering items
   },
   rentalVariant: {
        type: {
            variantId: String,
            variantName: String,
            variantPrice: Number
        },
        default: null
   }
},{
    timestamps : true
})


const addToCartModel = mongoose.model("addToCart",addToCart)

module.exports = addToCartModel