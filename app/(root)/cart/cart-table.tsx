'use client';

import { Cart, CartItem } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import { ArrowRight, Loader, Minus, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CartTableProps {
  cart?: Cart
};

const CartTable = ({ cart }: CartTableProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemoveFromCart = async (productId: string) => {
    startTransition(async () => {
      const { success, message } = await removeItemFromCart(productId);

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

  const handleAddToCart = async (item: CartItem) => {
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

  return (
    <>
      <h1 className='py-4 h2-bold'>Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href={'/'}>Go Shopping</Link>
        </div>
      ) : (
        <div className='grid md:grid-cols-4 md:gap-5'>
          <div className='overflow-x-auto md:col-span-3'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className='text-center'>Quantity</TableHead>
                  <TableHead className='text-right'>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map(item => (
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
                    <TableCell className='flex-center gap-2'>
                      <Button
                        disabled={isPending}
                        variant={'outline'}
                        type='button'
                        onClick={() => handleRemoveFromCart(item.productId)}
                      >
                        {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                      </Button>
                      <span className="px-2">{item.qty}</span>
                      <Button
                        disabled={isPending}
                        variant={'outline'}
                        type='button'
                        onClick={() => handleAddToCart(item)}
                      >
                        {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className='text-right'>
                      ${item.price}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card>
            <CardContent className='p-4 gap-4'>
              <div className='pb-3 text-xl'>
                Subtotal ({ cart.items.reduce((total, item) => total + item.qty, 0) }):
                <span className='font-bold'>${cart.itemsPrice}</span>
              </div>
              <Button className='w-full' disabled={isPending} onClick={() => startTransition(() => {
                router.push('/shipping-address')
              })}>
                {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CartTable;
