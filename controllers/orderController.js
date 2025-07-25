const Order = require("../models/Order");
const Product = require("../models/Product"); // برای چک کردن صحت محصولات

exports.createOrder = async (req, res) => {
  const { products, totalAmount } = req.body;

  try {
    // بررسی صحت محصولات
    const validProducts = [];
    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product with ID ${item.product} not found` });
      }
      validProducts.push({ product: item.product, quantity: item.quantity });
    }

    // ایجاد سفارش جدید
    const order = await Order.create({
      user: req.user.id,
      products: validProducts,
      totalAmount,
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product"); // نمایش جزئیات محصولات در هر سفارش
    res.json(orders);
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({ message: "Error fetching user orders", error });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user") // نمایش اطلاعات کاربر
      .populate("products.product"); // نمایش اطلاعات محصولات در هر سفارش
    res.json(orders);
  } catch (error) {
    console.error("Error getting all orders:", error);
    res.status(500).json({ message: "Error fetching all orders", error });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    // بررسی اینکه آیا سفارش وجود دارد
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // بروزرسانی وضعیت سفارش
    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status", error });
  }
};
