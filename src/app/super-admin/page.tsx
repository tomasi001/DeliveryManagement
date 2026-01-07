"use client";

import { useState, useEffect } from "react";
import { addUser, removeUser, updateUserRole } from "./actions";
import { createClient } from "@/lib/supabase/client";
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
  LogOut,
  Pencil,
  Plus,
} from "lucide-react";
import { signout } from "../login/actions";
import Link from "next/link";
import { Profile } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add User State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("driver");

  // Edit User State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editRole, setEditRole] = useState("driver");

  // Delete User State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const supabase = createClient();

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users", { description: error.message });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);

    const formData = new FormData();
    formData.append("email", newEmail);
    formData.append("password", newPassword);
    formData.append("role", newRole);

    const res = await addUser(formData);
    if (res.error) {
      toast.error("Failed to create user", { description: res.error });
    } else {
      toast.success("User created successfully");
      setNewEmail("");
      setNewPassword("");
      setNewRole("driver");
      setIsAddOpen(false);
      fetchUsers();
    }
    setAddLoading(false);
  }

  function openEditModal(user: Profile) {
    setEditingUser(user);
    setEditRole(user.role);
    setIsEditOpen(true);
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    
    setEditLoading(true);

    const formData = new FormData();
    formData.append("userId", editingUser.id);
    formData.append("role", editRole);

    const res = await updateUserRole(formData);
    if (res.error) {
      toast.error("Failed to update user role", { description: res.error });
    } else {
      toast.success("User role updated successfully");
      setIsEditOpen(false);
      setEditingUser(null);
      fetchUsers();
    }
    setEditLoading(false);
  }

  function openDeleteModal(user: Profile) {
    setDeletingUser(user);
    setIsDeleteOpen(true);
  }

  async function handleDeleteUser() {
    if (!deletingUser) return;
    
    setDeleteLoading(true);

    const res = await removeUser(deletingUser.id);
    if (res.error) {
      toast.error("Failed to remove user", { description: res.error });
    } else {
      toast.success("User removed successfully");
      setIsDeleteOpen(false);
      setDeletingUser(null);
      fetchUsers();
    }
    setDeleteLoading(false);
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 pt-10">
      <div className="max-w-5xl mx-auto space-y-8">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-neutral-500" />
                System Users ({users.length})
              </CardTitle>
              <CardDescription className="mt-1">
                Manage active users, assign roles, and control access.
              </CardDescription>
            </div>

            {/* Add User Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Add User
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
                      disabled={addLoading}
                    >
                      {addLoading ? (
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
              <div className="border rounded-lg overflow-hidden">
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
                disabled={editLoading}
              >
                {editLoading ? (
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
              disabled={deleteLoading}
            >
              {deleteLoading ? (
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
