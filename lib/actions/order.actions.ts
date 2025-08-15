'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Prisma } from '@prisma/client';
import { convertToPlainObject, formatErrors } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { paypal } from "../paypal";
import { Order, PaymentResult } from "@/types";
import { PAGE_SIZE } from "../constants";

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

export async function createPayPalOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({ where: { id: orderId } });

    if (order) {
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: '',
            status: '',
            pricePaid: 0,
          },
        },
      });

      return {
        success: true,
        message: 'Item order created successfully',
        data: paypalOrder.id,
      };
    } else {
      throw new Error('Order not found');
    }
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function approvePayPalOrder(orderId: string, data: { orderID: string }) {
  try {
    const order = await prisma.order.findFirst({ where: { id: orderId } });

    if (!order) throw new Error('Order not found');

    const captureDate = await paypal.capturePayment(data.orderID);

    if (!captureDate || captureDate.id !== (order.paymentResult as PaymentResult)?.id || captureDate.status !== 'COMPLETED') {
      throw new Error('Error in PayPal payment');
    }

    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureDate.id,
        status: captureDate.status,
        email_address: captureDate.payer.email_address,
        pricePaid: captureDate.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${order.id}`);

    return {
      success: true,
      message: 'Your order has been paid',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
    },
  });

  if (!order) throw new Error('Order not found');

  if (order.isPaid) throw new Error('Order is already paid');

  await prisma.$transaction(async (trx) => {
    for (const item of order.orderItems) {
      await trx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      });
    }

    await trx.order.update({
      where: { id: order.id },
      data: { 
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!updatedOrder) throw new Error('Order not found'); 

  return updatedOrder;
};

export async function getMyOrders({
  limit = PAGE_SIZE,
  page = 1,
}: {
  limit?: number;
  page?: number; 
}) {
  const session = await auth();

  if (!session) throw new Error('User is not authorized')

  const data = await prisma.order.findMany({
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: {
      userId: session?.user?.id,
    },
  });

  return {
    totalPages: Math.ceil(dataCount / limit),
    data,
  };
};

type SalesDataType = { month: string; totalSales: number };

export async function getOrderSummary() {
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  const totalSales = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
  });

  const salesDataRaw = await prisma.$queryRaw<Array<{ month: string; totalSales: Prisma.Decimal }>>`
    SELECT
      to_char("createdAt", 'MM/YY') as "month",
      sum("totalPrice") as "totalSales"
    FROM "Order"
    GROUP BY  to_char("createdAt", 'MM/YY')
  `;

  const salesData: SalesDataType[] = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));

  const latestSales = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
        },
      }
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestSales,
    salesData,
  };
};

export async function getAllOrders({
  limit = PAGE_SIZE,
  query,
  page = 1,
}: {
  limit?: number;
  query?: string; 
  page?: number;
}) {
  const queryFilter: Prisma.OrderWhereInput = query && query !== 'all'
    ? ({
        user: {
          name: {
            contains: query,
            mode: 'insensitive',
          }
        }
      })
    : {};

  const data = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: queryFilter,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: queryFilter,
  });

  return {
    totalPages: Math.ceil(dataCount / limit),
    data,
  };
};

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath('/admin/orders');
    return {
      success: true,
      message: 'Order deleted successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
    return {
      success: true,
      message: 'Order marked as paid',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      }
    });

    if (!order) throw new Error('Order not found');

    if (!order.isPaid) throw new Error('Order is not paid');

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order has been marked delivered',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};
