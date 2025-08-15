'use client'

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
} from "@/components/ui/table";
import { Order } from "@/types";
import Image from "next/image";
import Link from "next/link";
import {
  usePayPalScriptReducer,
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import {
  updateOrderToPaidCOD,
  approvePayPalOrder,
  createPayPalOrder,
  deliverOrder,
} from "@/lib/actions/order.actions";
import { toast } from "sonner";
import StripePayment from "./stripe-payment";

interface OrderDetailsTableProps {
  stripeClientSecret?: string | null; 
  paypalClientId: string;
  isAdmin?: boolean;
  order: Order;
};

const OrderDetailsTable = ({
  stripeClientSecret,
  paypalClientId,
  isAdmin,
  order,
}: OrderDetailsTableProps) => {
  const {
    shippingAddress,
    paymentMethod,
    shippingPrice,
    isDelivered,
    deliveredAt,
    itemsPrice,
    totalPrice,
    orderItems,
    taxPrice,
    isPaid,
    paidAt,
    id,
  } = order;

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    let status = '';
  
    if (isPending) {
      status = 'Loading PayPal...'
    } else if (isRejected) {
      status = 'Error Loading PayPal'
    }

    return status;
  };

  const handleCretePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }

    return res.data;
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => {
          const { success, message } = await updateOrderToPaidCOD(order.id);
          if (success) {
            toast.success(message);
          } else {
            toast.error(message);
          }
        })}
      >
        {isPending ? 'Processing...' : 'Mark As Paid'}
      </Button>
    );
  }; 

  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => {
          const { success, message } = await deliverOrder(order.id);
          if (success) {
            toast.success(message);
          } else {
            toast.error(message);
          }
        })}
      >
        {isPending ? 'Processing...' : 'Mark As Delivered'}
      </Button>
    );
  }; 

  return (
    <>
      <h1 className="py-4 text-2xl">
        Order: {id}
      </h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-y-4 overflow-x-auto">
          <Card>
            <CardContent className="gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p>{paymentMethod}</p>
              {isPaid && paidAt ? (
                <Badge variant={'secondary'} className="mt-2">
                  Paid at {paidAt?.toString()}
                </Badge>
              ) : (
                <Badge variant={'destructive'} className="mt-2">
                  Not Paid
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>{shippingAddress.streetAddress}, {shippingAddress.city}</p>
              <p>{shippingAddress.postalCode}, {shippingAddress.country}</p>
              {isDelivered ? (
                <Badge variant={'secondary'} className="mt-2">
                  Delivered at {deliveredAt?.toString()}
                </Badge>
              ) : (
                <Badge variant={'destructive'} className="mt-2">
                  Not Delivered
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map(item => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link href={`/product/${item.slug}`} className='flex item-center'>
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className='px-2'>{item.name}</span>
                        </Link> 
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-right">${item.price}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>${itemsPrice}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>${taxPrice}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>${shippingPrice}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>${totalPrice}</div>
              </div>

              {/* PayPal Payment */}
              {!isPaid && paymentMethod === 'PayPal' && (
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <PrintLoadingState />
                  <PayPalButtons
                    createOrder={handleCretePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                  />
                </PayPalScriptProvider>
              )}

              {/* Stripe Payment  */}
              {!isPaid && paymentMethod === 'Stripe' && stripeClientSecret && (
                <StripePayment
                  priceInCents={Math.round(Number(order.totalPrice) * 100)}
                  orderId={order.id}
                  clientSecret={stripeClientSecret}
                />
              )}

              {/* Cash On Delivery */}
              {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                <MarkAsPaidButton />
              )}

              {isAdmin && isPaid && !isDelivered && (
                <MarkAsDeliveredButton />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
