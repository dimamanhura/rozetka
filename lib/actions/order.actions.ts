'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatErrors } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";

export async function createOrder() {
  try {
    const session = await auth();

    if (!session) throw new Error('User is not authenticated');

    const cart = await getMyCart();
    const userId = session.user?.id;

    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        redirectTo: '/cart',
        success: false,
        message: 'Your cart is empty',
      }
    }

    if (!user?.address) {
      return {
        redirectTo: '/shipping-address',
        success: false,
        message: 'No shipping address',
      }
    }

    if (!user.paymentMethod) {
      return {
        redirectTo: '/payment-method',
        success: false,
        message: 'No payment method',
      }
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      taxPrice: cart.taxPrice,
      shippingPrice: cart.shippingPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (trx) => {
      const insertedOrder = await trx.order.create({
        data: order,
      });

      for (const item of cart.items) {
        await trx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }

      await trx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Order not created')

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${insertedOrderId}`,
    }
  } catch (err) {
    if (isRedirectError(err)) throw err;
  
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function getOrderById(orderId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return convertToPlainObject(order);
};
