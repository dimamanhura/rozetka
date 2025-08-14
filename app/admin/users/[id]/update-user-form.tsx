'use client';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Input } from "@/components/ui/input";
import { updateUserSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { USER_ROLES } from "@/lib/constants";
import { updateUser } from "@/lib/actions/user.actions";

interface UpdateUserFormProps {
  user: z.infer<typeof updateUserSchema>;
};

const UpdateUserForm = ({ user }: UpdateUserFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<(typeof updateUserSchema)>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user,
  });

  const onSubmit: SubmitHandler<z.infer<typeof updateUserSchema>> = async (values) => {
    const { success, message } = await updateUser(values);

    if (success) {
      toast.success(message);
      router.push('/admin/users');
    } else {
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form method="POST" className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter user email"
                    className="input-field"
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter user name"
                    className="input-field"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value.toString()}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_ROLES.map(role => (
                      <SelectItem value={role} key={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button type="submit" size={'lg'} className="button col-span-2 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Submitting...' : 'Update User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
 
export default UpdateUserForm;