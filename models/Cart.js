const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  product: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1,
    default: 1 
  },
  priceAtAddition: { 
    type: Number,
    required: true 
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const cartSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total price virtual field
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.priceAtAddition * item.quantity);
  }, 0);
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;