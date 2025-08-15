'use server';

import z from "zod";
import { insertReviewSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { formatErrors } from "../utils";
import { auth } from "@/auth";

export async function createOrUpdateReview(data: z.infer<typeof insertReviewSchema>) {
  try {
    const session = await auth();

    if (!session?.user?.id) throw new Error('User is not authenticated');

    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    });

    const product = await prisma.product.findFirst({ where: { id: data.productId } });

    if (!product) throw new Error('Product not found'); 

    const existedReview = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    });

    await prisma.$transaction(async (tx) => {
      if (existedReview) {
        await tx.review.update({
          data: { title: review.title, description: review.description, rating: review.rating },
          where: { id: existedReview.id },
        });
      } else {
        await tx.review.create({ data: review });
      }

      const avgRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      await tx.product.update({
        where: { id: review.productId },
        data: { numReviews, rating: avgRating._avg.rating || 0 },
      });
    }); 

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: 'Review updated successfully',
    };
  } catch (err) {

    console.log(err);
    return {
      success: false,
      message: formatErrors(err),
    };
  }
};

export async function getReviews({
  productId,
}: {
  productId: string;
}) {
  const data = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return { data };
};

export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();

  if (!session) throw new Error('User is not authenticated');

  return await prisma.review.findFirst({
    where: { productId, userId: session.user.id },
  });
};
