"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/use-users";
import {
  useAddUser,
  useUpdateUserRole,
  useRemoveUser,
} from "@/hooks/use-user-mutations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserPlus,
  Trash2,
  Loader2,
  ShieldAlert,
  ArrowLeft,
  User as UserIcon,
  ShieldCheck,
  Truck,
  Pencil,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Profile } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const { data: users = [], isLoading: loading, error } = useUsers();

  const addUserMutation = useAddUser();
  const updateUserRoleMutation = useUpdateUserRole();
  const removeUserMutation = useRemoveUser();

  // Add User State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("driver");

  // Edit User State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState("driver");

  // Delete User State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null);

  if (error) {
    toast.error("Failed to fetch users", { description: error.message });
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", newEmail);
    formData.append("password", newPassword);
    formData.append("role", newRole);

    try {
      await addUserMutation.mutateAsync(formData);
      toast.success("User created successfully");
      setNewEmail("");
      setNewPassword("");
      setNewRole("driver");
      setIsAddOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to create user", { description: message });
    }
  }

  function openEditModal(user: Profile) {
    setEditingUser(user);
    setEditRole(user.role);
    setIsEditOpen(true);
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData();
    formData.append("userId", editingUser.id);
    formData.append("role", editRole);

    try {
      await updateUserRoleMutation.mutateAsync(formData);
      toast.success("User role updated successfully");
      setIsEditOpen(false);
      setEditingUser(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to update user role", { description: message });
    }
  }

  function openDeleteModal(user: Profile) {
    setDeletingUser(user);
    setIsDeleteOpen(true);
  }

  async function handleDeleteUser() {
    if (!deletingUser) return;

    try {
      await removeUserMutation.mutateAsync(deletingUser.id);
      toast.success("User removed successfully");
      setIsDeleteOpen(false);
      setDeletingUser(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to remove user", { description: message });
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 pt-10">
      <div className="max-w-[1400px] mx-auto space-y-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                User Management
              </h1>
            </div>
          </div>
        </div>

        {/* User Table Card */}
        <Card className="shadow-md border-neutral-200 dark:border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-neutral-500" />
                <span className="hidden xs:inline">System Users</span>
                <span className="xs:hidden">Users</span>
                <span className="text-neutral-400 font-normal">
                  ({users.length})
                </span>
              </CardTitle>
              <CardDescription className="mt-1 hidden sm:block">
                Manage active users, assign roles, and control access.
              </CardDescription>
            </div>

            {/* Add User Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 shrink-0">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add User</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new internal system user with specific access
                    rights.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email Address</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="user@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Initial Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-role">System Role</Label>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger id="new-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-brand-primary hover:bg-brand-primary/90"
                      disabled={addUserMutation.isPending}
                    >
                      {addUserMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      Create User
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
                {/* Desktop View - Table (Visible on sm and larger) */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader className="bg-neutral-50 dark:bg-neutral-900">
                      <TableRow>
                        <TableHead>User Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-8 text-neutral-400"
                          >
                            No users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {user.role === "super_admin" && (
                                  <ShieldAlert className="w-3.5 h-3.5 text-brand-primary" />
                                )}
                                {user.role === "admin" && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                )}
                                {user.role === "driver" && (
                                  <Truck className="w-3.5 h-3.5 text-orange-500" />
                                )}
                                <span
                                  className={cn(
                                    "text-xs font-bold uppercase tracking-wider",
                                    user.role === "super_admin"
                                      ? "text-brand-primary"
                                      : user.role === "admin"
                                      ? "text-blue-600"
                                      : "text-orange-600"
                                  )}
                                >
                                  {user.role.replace("_", " ")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Edit Button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-neutral-500 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
                                  onClick={() => openEditModal(user)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>

                                {/* Remove Button */}
                                {user.role !== "super_admin" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    onClick={() => openDeleteModal(user)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View - Cards (Hidden on sm and larger) */}
                <div className="sm:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                      No users found.
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate pr-2">
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {user.role === "super_admin" && (
                              <ShieldAlert className="w-3 h-3 text-brand-primary" />
                            )}
                            {user.role === "admin" && (
                              <ShieldCheck className="w-3 h-3 text-blue-500" />
                            )}
                            {user.role === "driver" && (
                              <Truck className="w-3 h-3 text-orange-500" />
                            )}
                            <span
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                user.role === "super_admin"
                                  ? "text-brand-primary"
                                  : user.role === "admin"
                                  ? "text-blue-600"
                                  : "text-orange-600"
                              )}
                            >
                              {user.role.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-500 hover:bg-brand-primary/10 hover:text-brand-primary"
                            onClick={() => openEditModal(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          {/* Remove Button */}
                          {user.role !== "super_admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                              onClick={() => openDeleteModal(user)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Modify access permissions for {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                value={editingUser?.email || ""}
                disabled
                className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">System Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary/90"
                disabled={updateUserRoleMutation.isPending}
              >
                {updateUserRoleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingUser?.email}</strong>? This action cannot be
              undone and will permanently remove their access to the system.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteUser}
              disabled={removeUserMutation.isPending}
            >
              {removeUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
