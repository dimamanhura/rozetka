'use client';

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";

const CredentialsSignInForm = () => {
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  });
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className="w-full" variant={'default'}>
        {pending ? 'Signing in...': 'Sign In'}
      </Button>
    );
  };

  return (
    <form action={action}>
      <div className="space-y-6">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={"admin@example.com"}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="password"
            defaultValue={"123456"}
          />
        </div>
        <div>
          <SignInButton />
        </div>
        {data && !data.success && (
          <div className="text-center text-destructive">
            {data.message}
          </div>
        )}
        <div className="text-sm text-center text-muted-foreground">
          Do not have an account?{' '}
          <Link href={'/sign-up'} target="_self" className="link">Sign Up</Link>
        </div>
      </div>
    </form>
  );
};
 
export default CredentialsSignInForm;
