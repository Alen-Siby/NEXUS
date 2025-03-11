const addToCartModel = require("../../models/cartProduct");

const addToCartController = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const currentUser = req.userId;

    // Ensure quantity is a number
    const productQuantity = parseInt(quantity, 10);
    console.log(productQuantity)

    // Check if the product is already in the cart for the current user
    const isProductInCart = await addToCartModel.findOne({ productId, userId: currentUser });

    if (isProductInCart) {
      // Increment quantity with the new value passed in the request
      isProductInCart.quantity += productQuantity;
      const updatedCartProduct = await isProductInCart.save();

      return res.json({
        data: updatedCartProduct,
        message: "Product quantity updated in cart",
        success: true,
        error: false,
      });
    }

    // If product not in cart, create a new entry
    const payload = {
      productId: productId,
      quantity: productQuantity, // Set initial quantity
      userId: currentUser,
    };

    const newAddToCart = new addToCartModel(payload);
    const saveProduct = await newAddToCart.save();

    return res.json({
      data: saveProduct,
      message: "Product added to cart",
      success: true,
      error: false,
    });

  } catch (err) {
    return res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

const addToCartWithConfigController = async (req, res) => {
  try {
    const { productId, quantity, configuration } = req.body;
    const currentUser = req.userId;

    // Ensure quantity is a number
    const productQuantity = parseInt(quantity, 10);
    console.log('Product Quantity:', productQuantity);
    console.log('Configuration:', configuration);

    // Check if the product is already in the cart for the current user with the same configuration
    const isProductInCart = await addToCartModel.findOne({ 
      productId, 
      userId: currentUser,
      configuration: configuration // Include configuration in the search
    });

    if (isProductInCart) {
      // Increment quantity with the new value passed in the request
      isProductInCart.quantity += productQuantity;
      const updatedCartProduct = await isProductInCart.save();

      return res.json({
        data: updatedCartProduct,
        message: "Product quantity updated in cart",
        success: true,
        error: false,
      });
    }

    // If product not in cart or has different configuration, create a new entry
    const payload = {
      productId: productId,
      quantity: productQuantity,
      userId: currentUser,
      configuration: configuration // Add configuration to the payload
    };

    const newAddToCart = new addToCartModel(payload);
    const saveProduct = await newAddToCart.save();

    return res.json({
      data: saveProduct,
      message: "Product added to cart with configuration",
      success: true,
      error: false,
    });

  } catch (err) {
    return res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

const addToCartWithVariantController = async (req, res) => {
  try {
    const { productId, quantity, rentalVariant } = req.body; // Destructure rentalVariant from the request body
    const currentUser = req.userId;

    // Ensure quantity is a number
    const productQuantity = parseInt(quantity, 10);
    console.log('Product Quantity:', productQuantity);
    console.log('Rental Variant Details:', rentalVariant);

    // Check if the product with the same variant is already in the cart
    const isProductInCart = await addToCartModel.findOne({ 
      productId, 
      userId: currentUser,
      'rentalVariant.variantId': rentalVariant.variantId // Check for specific variant
    });

    if (isProductInCart) {
      // Increment quantity with the new value
      isProductInCart.quantity += productQuantity;
      const updatedCartProduct = await isProductInCart.save();

      return res.json({
        data: updatedCartProduct,
        message: "Product quantity updated in cart",
        success: true,
        error: false,
      });
    }

    // If product not in cart or has different variant, create a new entry
    const payload = {
      productId: productId,
      quantity: productQuantity,
      userId: currentUser,
      rentalVariant: {
        variantId: rentalVariant.variantId,
        variantName: rentalVariant.variantName,
        variantPrice: rentalVariant.variantPrice
      }
    };

    console.log('Creating new cart entry:', payload);

    const newAddToCart = new addToCartModel(payload);
    const saveProduct = await newAddToCart.save();

    return res.json({
      data: saveProduct,
      message: "Product added to cart",
      success: true,
      error: false,
    });

  } catch (err) {
    console.error('Add to Cart Error:', err);
    return res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

const addToCartWithBakeryConfigController = async (req, res) => {
  try {
    const { productId, selectedVariant, configuration } = req.body;
    const currentUser = req.userId;

    console.log('Adding bakery item to cart:', {
      productId,
      selectedVariant,
      configuration
    });

    // Check if the product with same variant and configuration exists in cart
    const isProductInCart = await addToCartModel.findOne({ 
      productId, 
      userId: currentUser,
      'bakeryVariant.variantId': selectedVariant._id,
      'bakeryVariant.configuration': configuration
    });

    if (isProductInCart) {
      // For bakery items, we don't increment quantity but update the configuration
      isProductInCart.bakeryVariant.configuration = configuration;
      const updatedCartProduct = await isProductInCart.save();

      return res.json({
        data: updatedCartProduct,
        message: "Bakery configuration updated in cart",
        success: true,
        error: false,
      });
    }

    // If product not in cart, create new entry
    const payload = {
      productId: productId,
      quantity: 1, // Initial quantity
      userId: currentUser,
      bakeryVariant: {
        variantId: selectedVariant._id,
        variantName: selectedVariant.itemName,
        variantPrice: selectedVariant.price,
        configuration: configuration,
        servingCapacity: selectedVariant.servingCapacity // Add serving capacity
      }
    };

    console.log('Creating new cart entry:', payload);

    const newAddToCart = new addToCartModel(payload);
    const saveProduct = await newAddToCart.save();

    return res.json({
      data: saveProduct,
      message: "Bakery items added to cart",
      success: true,
      error: false,
    });

  } catch (err) {
    console.error('Add Bakery to Cart Error:', err);
    return res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

// Export all controllers
module.exports = { 
  addToCartController, 
  addToCartWithConfigController,
  addToCartWithVariantController,
  addToCartWithBakeryConfigController
};


