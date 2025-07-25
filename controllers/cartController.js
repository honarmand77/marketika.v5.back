const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');


const { encryptData } = require("../utils/encryption");

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, userId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!productId) {
      return res.status(400).json({ 
        success: false,
        message: 'Product ID is required' 
      });
    }

    // Get product with price
    const product = await Product.findById(productId).select('price');
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already exists in cart
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Update quantity if product exists
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        priceAtAddition: product.price
      });
    }

    await cart.save();
    
    // Populate product details
    const populatedCart = await Cart.findById(cart._id).populate('items.product')


    res.status(200).json( encryptData({
        items: populatedCart.items,
        totalPrice: populatedCart.totalPrice,
        userId
      })
    );
    
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding to cart',
      error: error.message 
    });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(200).json(
         encryptData({
          items: [],
          totalPrice: 0,
          userId: null
        })
      );
    }

const cart = await Cart.findOne({ userId })
  .populate({
    path: 'items.product',
    model: 'Product',
    select: 'name price images likes stock',
    populate: [
      {
        path: 'category',
        model: 'Category',
        select: 'name'
      },
      {
        path: 'subCategory',
        model: 'SubCategory',
        select: 'name'
      }
    ]
  })
  .lean();
    res.status(200).json( encryptData({
        items: cart.items,
        totalPrice: cart.totalPrice,
        userId
      })
    );

  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cart',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User authentication required' 
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }

    // Remove item by _id
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json( encryptData({
        items: populatedCart.items,
        totalPrice: populatedCart.totalPrice,
        userId
      })
    );
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, userId } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User authentication required' 
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid quantity is required' 
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }

    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found in cart' 
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json( encryptData({
        items: populatedCart.items,
        totalPrice: populatedCart.totalPrice,
        userId
      })
    );
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Clear user's cart
exports.clearCart = async (req, res) => {
  try {
const userId = req.params.userId;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User authentication required' 
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    ).populate('items.product');

    res.status(200).json(encryptData({
        items: cart?.items || [],
        totalPrice: cart?.totalPrice || 0,
        userId
      })
    );
  } catch (error) {
    console.error('Error in clearCart:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};