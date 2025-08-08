import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsTable from "./order-details-table";
import { Order } from "@/types";
import { auth } from "@/auth";

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

  return (
    <>
      <OrderDetailsTable
        paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
        isAdmin={session?.user?.role === 'admin'}
        order={order as unknown as Order}
      />
    </>
  );
};
 
export default OrderDetailsPage;
