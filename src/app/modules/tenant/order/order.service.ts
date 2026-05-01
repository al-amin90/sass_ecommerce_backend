// src/modules/order/order.service.ts

import { getTenantModel } from "../../../utils/getTenantModel";
import { IOrder } from "./order.interface";

import { Types } from "mongoose";

const createOrderIntoDB = async (
  subdomain: string,
  userId: string | undefined,
  payload: IOrder,
) => {
  try {
    // Generate order number
    const Order = await getTenantModel(subdomain, "Order");

    const orderCount = await Order.countDocuments({ tenantId: subdomain });
    const orderNumber = `${subdomain.toUpperCase()}-ORD-${Date.now()}-${orderCount + 1}`;

    // Create order
    const order = await Order.create({
      tenantId: subdomain,
      userId: userId ? new Types.ObjectId(userId) : null,
      guestCheckout: payload.guestCheckout,
      guestEmail: payload.guestEmail,
      guestInfo: payload.guestInfo,
      items: payload.items,
      totalPrice: payload.totalPrice,
      paymentMethod: payload.paymentMethod,
      orderNumber,
    });

    // ✅ Populate product details
    const populatedOrder = await order.populate("items.productId");

    return populatedOrder;
  } catch (error) {
    throw error;
  }
};

const getAllOrdersFromDB = async (subdomain: string, userId?: string) => {
  try {
    let query: any = { tenantId: subdomain };
    const Order = await getTenantModel(subdomain, "Order");

    // যদি authenticated user থাকে, তার orders দেখাবে
    // যদি admin থাকে, সব orders দেখাবে (তার permission থাকলে)
    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate("items.productId", "name price images")
      .sort({ createdAt: -1 });

    return orders;
  } catch (error) {
    throw error;
  }
};

const getOrderByIdFromDB = async (subdomain: string, orderId: string) => {
  try {
    const Order = await getTenantModel(subdomain, "Order");

    const order = await Order.findOne({
      tenantId: subdomain,
      _id: new Types.ObjectId(orderId),
    })
      .populate("userId", "name email phone")
      .populate("items.productId", "name price images sku");

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  } catch (error) {
    throw error;
  }
};

const getGuestOrderFromDB = async (
  subdomain: string,
  email: string,
  orderId: string,
) => {
  try {
    const Order = await getTenantModel(subdomain, "Order");

    // Guest order retrieve (email + orderId verify)
    const order = await Order.findOne({
      tenantId: subdomain,
      _id: new Types.ObjectId(orderId),
      guestCheckout: true,
      guestEmail: email,
    }).populate("items.productId", "name price images sku");

    if (!order) {
      throw new Error("Order not found. Please check your email and order ID");
    }

    return order;
  } catch (error) {
    throw error;
  }
};

const updateOrderStatusInDB = async (
  subdomain: string,
  orderId: string,
  orderStatus?: string,
  paymentStatus?: string,
) => {
  try {
    const Order = await getTenantModel(subdomain, "Order");

    const updateData: any = {};

    if (orderStatus) {
      updateData.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const order = await Order.findOneAndUpdate(
      {
        tenantId: subdomain,
        _id: new Types.ObjectId(orderId),
      },
      updateData,
      { new: true },
    ).populate("items.productId");

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  } catch (error) {
    throw error;
  }
};

const cancelOrderInDB = async (subdomain: string, orderId: string) => {
  try {
    const Order = await getTenantModel(subdomain, "Order");

    // Order cancel করার আগে check করুন যে order পাঠানো হয়নি
    const order: IOrder | null = await Order.findOne({
      tenantId: subdomain,
      _id: new Types.ObjectId(orderId),
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      throw new Error("Cannot cancel shipped or delivered orders");
    }

    // Cancel করুন
    const cancelledOrder = await Order.findOneAndUpdate(
      {
        tenantId: subdomain,
        _id: new Types.ObjectId(orderId),
      },
      {
        orderStatus: "cancelled",
        paymentStatus: "failed",
      },
      { new: true },
    );

    return cancelledOrder;
  } catch (error) {
    throw error;
  }
};

export default {
  createOrderIntoDB,
  getAllOrdersFromDB,
  getOrderByIdFromDB,
  getGuestOrderFromDB,
  updateOrderStatusInDB,
  cancelOrderInDB,
};
