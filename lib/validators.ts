import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';
import { PAYMENT_METHODS } from './constants';

export const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    'Price must have exactly two decimal places',
  );

export const insertProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters'),
  category: z
    .string()
    .min(3, 'Category must be at least 3 characters'),
  brand: z
    .string()
    .min(3, 'Brand must be at least 3 characters'),
  description: z
    .string()
    .min(3, 'Brand must be at least 3 characters'),
  stock: z
    .coerce
    .number(),
  images: z
    .array(z.string())
    .min(1, 'Product must have at least 1 image'),
  isFeatured: z
    .boolean(),
  banner: z
    .string()
    .nullable(),
  price: currency,
});

export const signInFormSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must at least characters'),
});

export const signUpFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must at least characters'),
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must at least characters'),
  confirmPassword: z
    .string()
    .min(6, 'Confirm password must at least characters'),
}).refine(data =>  data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword']
});

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  qty: z.number().int().nonnegative('Quantity must be a positive number'),
  image: z.string().min(1, 'Image is required'),
  price: currency,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, 'Session cart id is required'),
  userId: z.string().optional().nullable(),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
  city: z.string().min(3, 'City must be at least 3 characters'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
  country: z.string().min(3, 'Country must be at least 3 characters'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const paymentMethodSchema = z.object({
  type: z.string().min(1, 'Payment method is required'),
}).refine(data =>  PAYMENT_METHODS.includes(data.type), {
  message: "Invalid payment method",
  path: ['type']
});

export const insertOrderSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  paymentMethod: z
    .string()
    .min(1, 'Payment method is required')
    .refine(paymentMethod =>  PAYMENT_METHODS.includes(paymentMethod), {
      message: "Invalid payment method",
    }),
  shippingAddress: shippingAddressSchema,
});

export const insertOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  slug: z.string().min(1, 'Slug is required'),
  image: z.string().min(1, 'Image is required'),
  name: z.string().min(1, 'Name is required'),
  price: currency,
  qty: z.number(),
});
