'use client';

import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/actions/order.actions";
import { Check, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

const PlaceOrderForm = () => {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const { success, message, redirectTo } = await createOrder();

    if (redirectTo) {
      toast.success(message);
      return router.push(redirectTo); 
    }
  };

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button className="w-full" disabled={pending}>
        {pending ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {' '}
        Place Order
      </Button>
    );
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <PlaceOrderButton />
    </form>
  );
}
 
export default PlaceOrderForm;
