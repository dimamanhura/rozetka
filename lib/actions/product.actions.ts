'use server';

import { prisma } from '@/db/prisma';
import { convertToPlainObject, formatErrors } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from 'next/cache';
import { insertProductSchema, updateProductSchema } from '../validators';
import z from 'zod';
import { Prisma } from '@prisma/client';

export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return convertToPlainObject(data);
};

export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({ where: { slug } });
};

export async function getProductById(productId: string) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
    },
  });
  return convertToPlainObject(product);
};

export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: {
  query?: string;
  limit: number;
  page: number;
  category?: string;
}) {
  const queryFilter: Prisma.ProductWhereInput = query && query !== 'all'
    ? ({
        name: {
          contains: query,
          mode: 'insensitive',
        }
      })
    : {};
  
  const data = await prisma.product.findMany({
    where: queryFilter,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  })

  const dataCount = await prisma.product.count({
    where: queryFilter,
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  }
};

export async function deleteProduct(id: string) {
  try {
    const existedProduct = await prisma.product.findFirst({
      where: { id }
    });

    if (!existedProduct) throw new Error('Product not found');
 
    await prisma.product.delete({ where: { id } });
  
    revalidatePath('/admin/products');
  
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);
    
    await prisma.product.create({
      data: product,
    });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product created successfully',
    };
  } catch (err) {

    console.log(err);
    return {
      success: false,
      message: formatErrors(err),
    };
  }
}

export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const existedProduct = await prisma.product.findFirst({
      where: { id: data.id }
    });

    if (!existedProduct) throw new Error('Product not found')

    const product = updateProductSchema.parse(data);
    
    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product updated successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: formatErrors(err),
    };
  }
}