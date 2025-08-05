'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { signInFormSchema } from '../validators';
import { signIn, signOut } from '@/auth';

export async function signInWithCredentials(prevState: unknown, formData: FormData) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', user);

    return { success: true, message: 'Signed in successfully' }
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }

    return { success: false, message: 'Invalid email or password' }
  } 
};

export async function signOutUser() {
  await signOut();
};
