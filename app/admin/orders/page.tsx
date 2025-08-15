import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Admin Orders',
} 

interface AdminOrdersPageProps {
  searchParams: Promise<{ page: string; query: string }>;
};

const AdminOrdersPage = async ({ searchParams }: AdminOrdersPageProps) => {
  const { page, query: searchText } = await searchParams;

  await requireAdmin();

  const orders = await getAllOrders({
    query: searchText || '',
    page: Number(page) || 1,
    limit: 10,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Orders</h1>
        {searchText && (
          <div>
            Filtered by <i>&quot;{searchText}&quot;</i>{' '}
            <Link href={'/admin/orders'}>
              <Button variant={'outline'} size={'sm'}>Remove Filter</Button>
            </Link>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>BUYER</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map(order => (
              <TableRow key={order.id}>
                <TableCell>
                  {order.id}
                </TableCell>
                <TableCell>
                  {order.createdAt.toDateString()}
                </TableCell>
                <TableCell>
                  {order.user.name}
                </TableCell>
                <TableCell>
                  ${order.totalPrice.toString()}
                </TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt ? (
                    order.paidAt.toDateString()
                  ) : (
                    'Not Paid'
                  )}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt ? (
                    order.deliveredAt.toDateString()
                  ) : (
                    'Not Delivered'
                  )}
                </TableCell>
                <TableCell>
                  <Button asChild variant={'outline'} size={'sm'}>
                    <Link href={`/order/${order.id}`}>
                      Details
                    </Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {
          orders.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={orders.totalPages} 
            />
          )
        }
      </div>
    </div>
  );
}
 
export default AdminOrdersPage;