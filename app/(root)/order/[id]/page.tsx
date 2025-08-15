import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsTable from "./order-details-table";
import { Order } from "@/types";
import { auth } from "@/auth";
import Stripe from 'stripe';


export const metadata: Metadata = {
  title: 'Place Order',
};

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>
};

const OrderDetailsPage = async ({ params }: OrderDetailsPageProps) => {
  const { id } = await params;
  const order = await getOrderById(id);
  
  if (!order) {
    return notFound();
  }

  const session = await auth();

  let client_secret = null;

  if (order.paymentMethod === 'Stripe' && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: 'USD',
      metadata: { orderId: order.id },
    });
    client_secret = paymentIntent.client_secret;
  }

  return (
    <>
      <OrderDetailsTable
        stripeClientSecret={client_secret}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
        isAdmin={session?.user?.role === 'admin'}
        order={order as unknown as Order}
      />
    </>
  );
};
 
export default OrderDetailsPage;
