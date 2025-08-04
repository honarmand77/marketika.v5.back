const Order = require('../models/Order');
const Product = require('../models/Product');


// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    shippingPrice,
    taxPrice
  } = req.body;

  if (!items || items.length === 0) {
    return 'No order items', 400;
  }

  // بررسی موجودی محصولات
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return `Product not found with id ${item.product}`, 404;
    }
    if (product.countInStock < item.quantity) {
      return `Not enough stock for ${product.name}`, 400;
    }
  }

  const order = new Order({
    user: req.user._id,
    items: items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price
    })),
    shippingAddress,
    paymentMethod,
    shippingPrice,
    taxPrice,
    itemsPrice: items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    totalPrice: items.reduce((acc, item) => acc + (item.price * item.quantity), 0) + shippingPrice + taxPrice
  });

  // کاهش موجودی محصولات
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { countInStock: -item.quantity } }
    );
  }

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name image');

  if (!order) {
    return 'Order not found', 404;
  }

  // بررسی مالکیت سفارش (کاربر یا ادمین)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return 'Not authorized to access this order', 401;
  }

  res.json(order);
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getOrdersByUser = async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  const orders = await Order.find({})
    .populate('user', 'id name')
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  
  const order = await Order.findById(req.params.id);
  if (!order) {
    return 'Order not found', 404;
  }

  // بررسی وضعیت فعلی
  if (order.status === 'cancelled') {
    return 'Cannot update a cancelled order', 400;
  }

  order.status = status;
  
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return 'Order not found', 404;
  }

  // بررسی مالکیت سفارش
  if (order.user.toString() !== req.user._id.toString()) {
    return 'Not authorized to cancel this order', 401;
  }

  // بررسی وضعیت فعلی
  if (order.status === 'delivered' || order.status === 'cancelled') {
    return `Order already ${order.status}`, 400;
  }

  // برگشت موجودی محصولات
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { countInStock: item.quantity } }
    );
  }

  order.status = 'cancelled';
  const updatedOrder = await order.save();
  res.json(updatedOrder);
};

// @desc    Get order invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.getOrderInvoice = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return 'Order not found', 404;
  }

  // بررسی مالکیت سفارش
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return 'Not authorized to access this invoice', 401;
  }

  // در اینجا باید منطق تولید فاکتور پیاده‌سازی شود
  // برای سادگی، فعلاً اطلاعات سفارش را برمی‌گردانیم
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
  
  // در واقعیت باید از کتابخانه‌ای مثل pdfkit استفاده کنید
  res.json({
    message: 'Invoice PDF would be generated here',
    order
  });
};