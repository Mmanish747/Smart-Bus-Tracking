"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import DataTable, { Column } from "@/component/ui/DataTable";
import ConfirmDialog from "@/component/ui/ConfirmDialog";
import PageHeader from "@/component/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, UsersResponse, UserData } from "@/utils/api";

const roleColors: Record<string, string> = {
  admin: "bg-green-100 text-green-700",
  driver: "bg-blue-100 text-blue-700",
  passenger: "bg-gray-100 text-gray-600",
};

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState<UserData | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await fetchApi<UsersResponse>("/users", {}, token);
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await fetchApi(`/users/${deleting._id}`, { method: "DELETE" }, token);
      setShowDeleteConfirm(false);
      setDeleting(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const columns: Column<UserData>[] = [
    {
      key: "name",
      label: "Name",
      searchable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {item.name?.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    { key: "email", label: "Email", searchable: true },
    {
      key: "role",
      label: "Role",
      render: (item) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleColors[item.role] || "bg-gray-100 text-gray-600"}`}>
          {item.role}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description="View and manage registered users"
        action={
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Users size={16} />
            {users.length} total users
          </div>
        }
      />

      <DataTable
        data={users as any}
        columns={columns}
        onDelete={(item) => { setDeleting(item); setShowDeleteConfirm(true); }}
        loading={loading}
        emptyMessage="No users found"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleting(null); }}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleting?.name || "this user"}? This action cannot be undone.`}
      />
    </div>
  );
}
