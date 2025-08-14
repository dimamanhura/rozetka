import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteUser, getAllUsers } from "@/lib/actions/user.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Admin Users',
} 

interface AdminOrdersPageProps {
  searchParams: Promise<{
    page: string;
    query: string;
  }>;
};

const AdminUsersPage = async (props: AdminOrdersPageProps) => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || '';

  await requireAdmin();

  const users = await getAllUsers({
    limit: 10,
    page: Number(page) || 1,
    query: searchText,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Users</h1>
        {searchText && (
          <div>
            Filtered by <i>&quot;{searchText}&quot;</i>{' '}
            <Link href={'/admin/users'}>
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
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead className="w-[100px]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'user' ? (
                    <Badge variant={'secondary'}>User</Badge>
                  ) : (
                    <Badge variant={'default'}>Admin</Badge>
                  )}
                </TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant={'outline'} size={'sm'}>
                    <Link href={`/admin/users/${user.id}`}>
                      Edit
                    </Link>
                  </Button>
                  <DeleteDialog id={user.id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {
          users.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={users.totalPages} 
            />
          )
        }
      </div>
    </div>
  );
}
 
export default AdminUsersPage;