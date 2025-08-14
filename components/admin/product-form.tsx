'use client';

import slugify from 'slugify';
import { insertProductSchema } from "@/lib/validators";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "../ui/button";
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { createProduct, updateProduct } from '@/lib/actions/product.actions';
import { UploadButton } from '@/lib/uploadthing';

interface ProductFormProps {
  type: 'Update' | 'Create',
  product?: Product;
  productId?: string;
};

const ProductForm = ({ productId, product, type }: ProductFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<(typeof insertProductSchema)>>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: product
      ? product
      : ({
        name: '',
        slug: '',
        category: '',
        brand: '',
        description: '',
        stock: 500,
        images: [],
        isFeatured: false,
        banner: null,
        price: '',
      }),
  });

  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (values) => {
    if (type === 'Create') {
      const { success, message } = await createProduct(values);

      if (success) {
        toast.success(message);
        router.push('/admin/products');
      } else {
        toast.error(message);
      }
    } else {
      if (!productId) {
        router.push('/admin/products');
        return 
      }
    
      const { success, message } = await updateProduct({ ...values, id: productId});

      if (success) {
        toast.success(message);
        router.push('/admin/products');
      } else {
        toast.error(message);
      }
    }
  };

  const images = form.watch('images');
  const isFeatured = form.watch('isFeatured');
  const banner = form.watch('banner');

   return (
    <Form {...form}>
      <form method="POST" className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter product name"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter slug"
                      className="input-field"
                      {...field}
                    />
                    <Button type="button" className="px-4 mt-2" onClick={() => {
                      form.setValue('slug', slugify(form.getValues('name'), { lower: true}))
                    }}>
                      Generate
                    </Button>
                  </div>
                  
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter category"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter brand"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter product price"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter stock"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="upload-field">
          Featured product
          <Card>
            <CardContent className="space-y-2 mt-2">
              <FormField
                control={form.control}
                name={'isFeatured'}
                render={({ field }) => (
                  <FormItem className="flex space-x-2 items-center">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Is Featured</FormLabel>
                  </FormItem>
                )}
              />
        
              {isFeatured && banner && (
                <Image
                  src={banner}
                  alt="banner image"
                  className="w-full object-cover object-center rounded-sm"
                  width={1920}
                  height={680}
                />
              )}

              {isFeatured && !banner && (
                <UploadButton
                  endpoint={'imageUploader'}
                  onClientUploadComplete={(res: { url: string; }[]) => {
                    form.setValue('banner', res[0].url)
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Error! ${error.message}`);
                  }}
                />
              )}
            </CardContent>  
          </Card>  
        </div>

        <div className="upload-field">
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2 min-h-48">
                    <div className="flex-start space-x-2">
                      {images.map((image: string) => (
                        <Image
                          key={image}
                          src={image}
                          width={100}
                          height={100}
                          alt="product image"
                          className="w-20 h-20 object-cover object-center rounded-sm"
                        />
                      ))}
                      <FormControl>
                        <UploadButton
                          endpoint={'imageUploader'}
                          onClientUploadComplete={(res: { url: string; }[]) => {
                            form.setValue('images', [...images, res[0].url])
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(`Error! ${error.message}`);
                          }}
                        />
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button type="submit" size={'lg'} className="button col-span-2 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Submitting...' : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
 
export default ProductForm;