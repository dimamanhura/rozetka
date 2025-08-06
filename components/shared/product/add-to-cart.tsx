'use client';

import { Button } from "@/components/ui/button";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { Cart, CartItem } from "@/types";
import { Plus, Minus, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface AddToCartProps {
  item: CartItem;
  cart?: Cart; 
};

const AddToCart = ({ item, cart }: AddToCartProps) => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const { success, message } = await addItemToCart(item);

      if (success) {
        toast.success(message, {
          action: {
            label: 'Go To Cart',
            onClick: () => router.push('/cart'),
          },
        });
      } else {
        toast.error(message);
      }
    })
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const { success, message } = await removeItemFromCart(item.productId);

      if (success) {
        toast.success(message, {
          action: {
            label: 'Go To Cart',
            onClick: () => router.push('/cart'),
          },
        });
      } else {
        toast.error(message);
      }
    });
  };

  const existedItem = cart?.items.find(i => i.productId === item.productId);

  if (existedItem) {
    return (
      <div>
        <Button type="button" variant={'outline'} onClick={handleRemoveFromCart}>
          {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
        </Button>
        <span className="px-2">{existedItem.qty}</span>
        <Button type="button" variant={'outline'} onClick={handleAddToCart}>
          {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  return (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add To Cart
    </Button>
  );
}
 
export default AddToCart;