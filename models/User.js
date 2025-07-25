const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: "user" },
    profilePicture: {
      type: String,
      default: "https://www.muslim-marriages.com/wp-content/uploads/avatars/26006/noprofile-bpfull.png",
    },
    shippingAddress: {
      fullName: { type: String },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Wishlist" }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: "History" }],
    viewedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  
  { timestamps: true }
);
userSchema.pre('remove', async function(next) {
  await this.model('Cart').deleteOne({ user: this._id });
  next();
});
module.exports = mongoose.model("User", userSchema);
