'use server';

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convertToPlainObject, formatErrors, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce((total, item) => total + Number(item.price) * item.qty, 0)
  );
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(0.15 * itemsPrice);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    const sessionCartId = await (await cookies()).get('sessionCartId')?.value;

    if (!sessionCartId) throw new Error('Cart session not found');

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    const cart = await getMyCart();
    const item = cartItemSchema.parse(data);

    const product = await prisma.product.findFirst({ where: { id: item.productId } });

    if (!product) throw new Error('Product not found');

    if (!cart) {
      const newCart = insertCartSchema.parse({
        sessionCartId: sessionCartId,
        userId,
        items: [item],
        ...calcPrice([item]),
      });

      await prisma.cart.create({ data: newCart });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    }

    const existItem = cart.items.find(x => x.productId === item.productId);

    if (existItem) {
      if (product.stock < existItem.qty + 1) {
        throw new Error('Not enough stock');
      }

      existItem.qty = existItem.qty + 1; 
    } else {
      if (product.stock < 1) {
        throw new Error('Not enough stock');
      }
    
      cart.items.push(item);
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: { items: cart.items, ...calcPrice(cart.items) },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`,
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function getMyCart() {
  const sessionCartId = await (await cookies()).get('sessionCartId')?.value;

  if (!sessionCartId) throw new Error('Cart session not found');

  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;
  
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId },
  });

  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.itemsPrice.toString(),
    shippingPrice: cart.itemsPrice.toString(),
    taxPrice: cart.itemsPrice.toString(),
  });
};

export async function removeItemFromCart(productId: string) {
  try { 
    const sessionCartId = await (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Cart session not found'); 

    const product = await prisma.product.findFirst({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    const cart = await getMyCart();
    if (!cart) throw new Error('Cart not found');

    const existItem = cart.items.find(item => item.productId === productId);
    if (!existItem) throw new Error('Item not found');

    if (existItem.qty === 1) {
      cart.items = cart.items.filter(item => item.productId !== productId);
    } else {
      existItem.qty = existItem.qty - 1;
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: { items: cart.items, ...calcPrice(cart.items) },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} was removed from cart`,
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};
