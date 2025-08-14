import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllProducts, deleteProduct } from "@/lib/actions/product.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Admin Products',
} 

interface AdminOrdersPageProps {
  searchParams: Promise<{
    query: string;
    category: string;
    page: string;
  }>;
};

const AdminProductsPage = async (props: AdminOrdersPageProps) => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || '';
  const category = searchParams.category || '';

  await requireAdmin();

  const products = await getAllProducts({
    category,
    limit: 10,
    query: searchText,
    page: Number(page) || 1,
  });

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <h1 className="h2-bold">Products</h1>
        <Button asChild variant={'default'}>
          <Link href={'/admin/products/create'}>
            Create Product
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead className="text-right">PRICE</TableHead>
              <TableHead>CATEGORY</TableHead>
              <TableHead>STOCK</TableHead>
              <TableHead>RATING</TableHead>
              <TableHead className="w-[100px]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.data.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price.toString()}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.rating}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant={'outline'} size={'sm'}>
                    <Link href={`/admin/products/${product.id}`}>
                      Details
                    </Link>
                  </Button>
                  <DeleteDialog id={product.id} action={deleteProduct} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {
          products.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={products.totalPages} 
            />
          )
        }
      </div>
    </div>
  );
}
 
export default AdminProductsPage;