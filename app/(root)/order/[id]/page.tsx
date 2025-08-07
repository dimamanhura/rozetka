import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsTable from "./order-details-table";
import { Order } from "@/types";

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

  return (
    <>
      <OrderDetailsTable order={order as unknown as Order} />
    </>
  );
};
 
export default OrderDetailsPage;
