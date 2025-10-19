const Order = require('../models/OrderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const InventoryService = require('../services/inventoryService');
const CouponService = require('../services/couponService');
const ResponseFactory = require('../utils/response');
const logger = require('../utils/logger');

// Crear una nueva orden
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'cash', paymentIntentId, couponCode, status = 'pending', trackingNumber } = req.body;
    const userId = req.user.id;

    // Validar que hay items
    if (!items || items.length === 0) {
      return ResponseFactory.error(res, 'El carrito está vacío', 400);
    }

    // Validar productos y calcular totales
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return ResponseFactory.error(res, `Producto no encontrado: ${item.product}`, 400);
      }

      if (product.stock < item.quantity) {
        return ResponseFactory.error(res, `Stock insuficiente para ${product.name}`, 400);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Calcular total con envío (asumiendo envío fijo de $5000)
    const shippingCost = 5000;
    let total = subtotal + shippingCost;
    let discountAmount = 0;
    let couponApplied = null;

    // Aplicar cupón si se proporciona
    if (couponCode) {
      const orderData = {
        subtotal,
        shippingCost,
        total,
        items: validatedItems
      };

      const couponResult = await CouponService.validateAndApplyCoupon(couponCode, orderData, userId);
      
      if (couponResult.success) {
        discountAmount = couponResult.coupon.discountAmount;
        total = Math.max(0, total - discountAmount);
        couponApplied = couponResult.coupon;
      } else {
        return ResponseFactory.error(res, couponResult.error, 400);
      }
    }

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Crear la orden
    const orderData = {
      user: userId,
      orderNumber,
      items: validatedItems,
      subtotal,
      shippingCost,
      discountAmount,
      total,
      status: status,
      trackingNumber: status === 'shipped' ? trackingNumber : undefined,
      paymentMethod,
      coupon: couponApplied ? {
        code: couponApplied.code,
        name: couponApplied.name,
        discountAmount: couponApplied.discountAmount
      } : null,
      paymentInfo: {
        method: paymentMethod,
        amount: total,
        status: paymentMethod === 'stripe' ? 'pending' : 'pending',
        currency: 'clp',
        stripePaymentIntentId: paymentIntentId || null,
        paymentIntentId: paymentIntentId || null
      },
      shippingAddress: {
        firstName: shippingAddress.firstName || 'Usuario',
        lastName: shippingAddress.lastName || 'Test',
        address: shippingAddress.address || shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone || '123456789',
        email: shippingAddress.email || req.user.email
      }
    };

    const order = new Order(orderData);
    await order.save();

    // Actualizar stock de productos usando el servicio de inventario
    for (const item of validatedItems) {
      await InventoryService.recordMovement(
        item.product,
        'sale',
        item.quantity,
        userId,
        order._id,
        'Venta realizada',
        `Orden ${order.orderNumber}`
      );
    }

    logger.info(`Orden creada exitosamente`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId,
      total: order.total
    });

    ResponseFactory.success(res, { order }, 'Orden creada exitosamente', 201);
  } catch (error) {
    logger.error('Error al crear orden:', error);
    ResponseFactory.error(res, 'Error interno del servidor', 500);
  }
};

// Obtener órdenes del usuario
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    ResponseFactory.success(res, {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Órdenes obtenidas exitosamente');
  } catch (error) {
    logger.error('Error al obtener órdenes del usuario:', error);
    ResponseFactory.error(res, 'Error interno del servidor', 500);
  }
};

// Obtener orden por ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(id).populate('items.product', 'name price image');

    if (!order) {
      return ResponseFactory.error(res, 'Orden no encontrada', 404);
    }

    // Verificar que el usuario puede ver esta orden
    if (userRole !== 'admin' && order.user.toString() !== userId) {
      return ResponseFactory.error(res, 'No autorizado para ver esta orden', 403);
    }

    ResponseFactory.success(res, { order }, 'Orden obtenida exitosamente');
  } catch (error) {
    logger.error('Error al obtener orden por ID:', error);
    ResponseFactory.error(res, 'Error interno del servidor', 500);
  }
};

// Actualizar estado de orden (solo admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, cancellationReason } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return ResponseFactory.error(res, 'Estado de orden inválido', 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      return ResponseFactory.error(res, 'Orden no encontrada', 404);
    }

    // Validaciones de negocio
    if (status === 'cancelled' && order.status === 'delivered') {
      return ResponseFactory.error(res, 'No se puede cancelar una orden ya entregada', 400);
    }

    if (status === 'cancelled' && order.status === 'cancelled') {
      return ResponseFactory.error(res, 'La orden ya está cancelada', 400);
    }

    // Actualizar campos según el estado
    order.status = status;
    
    if (status === 'shipped' && trackingNumber) {
      order.trackingNumber = trackingNumber;
      order.shippedAt = new Date();
    }
    
    if (status === 'cancelled' && cancellationReason) {
      order.cancellationReason = cancellationReason;
      order.cancelledAt = new Date();
    }

    await order.save();

    logger.info(`Estado de orden actualizado`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      newStatus: status,
      updatedBy: req.user.id
    });

    ResponseFactory.success(res, { order }, 'Estado de orden actualizado exitosamente');
  } catch (error) {
    logger.error('Error al actualizar estado de orden:', error);
    ResponseFactory.error(res, 'Error interno del servidor', 500);
  }
};

// Obtener todas las órdenes (solo admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'username email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    ResponseFactory.success(res, {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Todas las órdenes obtenidas exitosamente');
  } catch (error) {
    logger.error('Error al obtener todas las órdenes:', error);
    ResponseFactory.error(res, 'Error interno del servidor', 500);
  }
};

// Procesar devolución de orden
const processOrderReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(id);
    if (!order) {
      return ResponseFactory.error(res, 'Orden no encontrada', 404);
    }

    // Verificar que el usuario puede procesar esta devolución
    if (order.user.toString() !== userId) {
      return ResponseFactory.error(res, 'No autorizado para procesar esta devolución', 403);
    }

    // Procesar devolución de cada item
    for (const item of items) {
      await InventoryService.recordMovement(
        item.product,
        'return',
        item.quantity,
        userId,
        order._id,
        reason || 'Devolución de producto',
        `Devolución de orden ${order.orderNumber}`
      );
    }

    // Actualizar estado de la orden
    order.status = 'returned';
    await order.save();

    logger.info(`Devolución procesada exitosamente`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId,
      itemsReturned: items.length
    });

    ResponseFactory.success(res, { order }, 'Devolución procesada exitosamente');
  } catch (error) {
    logger.error('Error al procesar devolución:', error);
    ResponseFactory.error(res, 'Error interno del servidor', 500);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  processOrderReturn
};
