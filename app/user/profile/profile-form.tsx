'use client';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/actions/user.actions";
import { updateProfileSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const ProfileForm = () => {
  const { data: session, update } = useSession();
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? '',
      email: session?.user?.email ?? '',
    },
  });


  const onSubmit: SubmitHandler<z.infer<typeof updateProfileSchema>> = async (values) => {
    const { success, message } = await updateProfile(values);

    if (success) {
      const newSession = {
        ...session,
        user: {
          ...session?.user,
          name: values.name,
        },
      };
      await update(newSession);
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form method="post" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input disabled placeholder="Email" className="input-field" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
             />

             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" className="input-field" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
             />
          </div>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting} size={'lg'} className="button col-span-2 w-full">
          {form.formState.isSubmitting ? 'Submitting...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  );
}
 
export default ProfileForm;