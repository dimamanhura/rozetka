'use client'

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types";
import Image from "next/image";
import Link from "next/link";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { createPayPalOrder, approvePayPalOrder } from "@/lib/actions/order.actions";
import { toast } from "sonner";

const OrderDetailsTable = ({
  paypalClientId,
  order,
}: {
  paypalClientId: string,
  order: Order,
}) => {
  const {
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    orderItems,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
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
              {isPaid ? (
                <Badge variant={'secondary'} className="mt-2">
                  Paid at {paidAt?.toISOString()}
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
                  Delivered at {deliveredAt?.toISOString()}
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
            </CardContent>
            {/* PayPal Payment  */}
            {!isPaid && paymentMethod === 'PayPal' && (
              <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                <PrintLoadingState />
                <PayPalButtons
                  createOrder={handleCretePayPalOrder}
                  onApprove={handleApprovePayPalOrder}
                />
              </PayPalScriptProvider>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
 
export default OrderDetailsTable;