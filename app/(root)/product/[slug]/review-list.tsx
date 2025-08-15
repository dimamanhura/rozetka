'use client';

import { useEffect } from "react";
import { Review } from "@/types";
import Link from "next/link";
import { useState } from "react";
import ReviewForm from "./review-form";
import { getReviews,  } from "@/lib/actions/review.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import Rating from "@/components/shared/product/rating";

interface ReviewListProps {
  productSlug: string;
  productId: string;
  userId: string;
};

const ReviewList = ({ productSlug, productId, userId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews([...res.data]);
  };

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
    };

    loadReviews();
  }, [productId]);
 
  return (
    <div className="space-y-4">
      {reviews.length === 0 && (
        <div>No reviews yet</div>
      )}

      {userId ? (
        <ReviewForm
          productId={productId}
          userId={userId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div>
          Please <Link className="text-blue-700 px-2" href={`/sign-in?callbackUrl=/product/${productSlug}`}>sign in</Link> to write review
        </div>
      )}

      <div className="flex flex-col gap-3">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex-between">
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>
                {review.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <Rating value={review.rating} />
                <div className="flex items-center">
                  <User className="mr-1 h-3 w-3" />
                  {review.user ? review.user.name : 'User'}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {review.createdAt.toDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
