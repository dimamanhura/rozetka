import ProductForm from "@/components/admin/product-form";
import { getProductById } from "@/lib/actions/product.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: 'Update Product',
};

interface AdminProductUpdatePageProps {
  params: Promise<{ id: string }>;
}

const AdminProductUpdatePage = async ({ params }: AdminProductUpdatePageProps) => {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    return notFound();
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Product</h1>
      <ProductForm
        productId={product.id}
        product={product}
        type="Update"
      />
    </div>
  );
}
 
export default AdminProductUpdatePage;