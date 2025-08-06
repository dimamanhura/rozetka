import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));  
};

export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');
  return decimal
    ? `${int}.${decimal.padEnd(2, '0')}`
    : `${int}.00`; 
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatErrors(error: any) {
  if (error.name === 'ZodError') {
    const fieldErrors = JSON.parse(error.message).map(({ message }: { message: string }) => message);
    return fieldErrors.join('. ');
  }
  
  if (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
    const field = error.meta?.target ? error.meta.target[0] : 'Field'; 
    return `${field.charAt(0).toUpperCase()}${field.slice(1)} already exist`;
  }

  return typeof error.message === 'string'
    ? error.message
    : JSON.stringify(error.message);
};

export function round2(value: number | string) {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100; 
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100; 
  } else {
    throw new Error('Value is not a number or string')
  }
}
