"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DataTable, { Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import ConfirmDialog from "@/component/ui/ConfirmDialog";
import PageHeader from "@/component/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  fetchApi,
  NotificationsResponse,
  NotificationData,
} from "@/utils/api";

const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  badge: z.string().min(1, "Badge type is required"),
  icon: z.string().min(1, "Icon is required"),
  iconBg: z.string(),
  iconColor: z.string(),
  badgeBg: z.string(),
  badgeColor: z.string(),
});

type NotificationForm = z.infer<typeof notificationSchema>;

const badgeTypes = ["Alert", "Service Update", "Promotion", "General"];

const badgePresets: Record<string, { iconBg: string; iconColor: string; badgeBg: string; badgeColor: string; icon: string }> = {
  Alert: { iconBg: "bg-red-100", iconColor: "text-red-500", badgeBg: "bg-red-100", badgeColor: "text-red-600", icon: "AlertTriangle" },
  "Service Update": { iconBg: "bg-blue-100", iconColor: "text-blue-500", badgeBg: "bg-blue-100", badgeColor: "text-blue-600", icon: "Info" },
  Promotion: { iconBg: "bg-green-100", iconColor: "text-green-500", badgeBg: "bg-green-100", badgeColor: "text-green-600", icon: "Gift" },
  General: { iconBg: "bg-gray-100", iconColor: "text-gray-500", badgeBg: "bg-gray-100", badgeColor: "text-gray-600", icon: "Bell" },
};

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<NotificationData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState<NotificationData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      icon: "Bell",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      badgeBg: "bg-red-100",
      badgeColor: "text-red-600",
    },
  });

  const selectedBadge = watch("badge");

  useEffect(() => {
    if (selectedBadge && badgePresets[selectedBadge]) {
      const preset = badgePresets[selectedBadge];
      setValue("iconBg", preset.iconBg);
      setValue("iconColor", preset.iconColor);
      setValue("badgeBg", preset.badgeBg);
      setValue("badgeColor", preset.badgeColor);
      setValue("icon", preset.icon);
    }
  }, [selectedBadge, setValue]);

  const fetchNotifications = async () => {
    try {
      const data = await fetchApi<NotificationsResponse>("/notifications", {}, token);
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    reset({
      title: "",
      description: "",
      badge: "",
      icon: "Bell",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      badgeBg: "bg-red-100",
      badgeColor: "text-red-600",
    });
    setShowModal(true);
  };

  const openEdit = (n: NotificationData) => {
    setEditing(n);
    reset({
      title: n.title,
      description: n.description,
      badge: n.badge,
      icon: n.icon,
      iconBg: n.iconBg,
      iconColor: n.iconColor,
      badgeBg: n.badgeBg,
      badgeColor: n.badgeColor,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: NotificationForm) => {
    setSubmitting(true);
    try {
      if (editing) {
        await fetchApi(`/notifications/${editing._id}`, { method: "PUT", body: JSON.stringify(data) }, token);
      } else {
        await fetchApi("/notifications", { method: "POST", body: JSON.stringify(data) }, token);
      }
      setShowModal(false);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to save notification:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await fetchApi(`/notifications/${deleting._id}`, { method: "DELETE" }, token);
      setShowDeleteConfirm(false);
      setDeleting(null);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const columns: Column<NotificationData>[] = [
    { key: "title", label: "Title", searchable: true },
    {
      key: "description",
      label: "Description",
      render: (item) => (
        <span className="max-w-xs truncate">{item.description.length > 50 ? item.description.slice(0, 50) + "..." : item.description}</span>
      ),
    },
    {
      key: "badge",
      label: "Badge",
      render: (item) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${item.badgeBg} ${item.badgeColor}`}>
          {item.badge}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Notification Management"
        description="Manage alerts, service updates, and promotions"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
          >
            <Plus size={16} />
            Add Notification
          </button>
        }
      />

      <DataTable
        data={notifications as any}
        columns={columns}
        onEdit={openEdit}
        onDelete={(item) => { setDeleting(item); setShowDeleteConfirm(true); }}
        loading={loading}
        emptyMessage="No notifications found"
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Notification" : "Add Notification"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input {...register("title")} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea {...register("description")} rows={3} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Badge Type</label>
            <select {...register("badge")} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <option value="">Select type</option>
              {badgeTypes.map((bt) => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
            {errors.badge && <p className="mt-1 text-xs text-red-500">{errors.badge.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Icon</label>
              <input {...register("icon")} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Badge Color</label>
              <input {...register("badgeColor")} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50">
              {submitting ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleting(null); }}
        onConfirm={handleDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
      />
    </div>
  );
}
