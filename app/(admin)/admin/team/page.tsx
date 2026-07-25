"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, TeamData, TeamResponse } from "@/utils/api";
import DataTable, { Column } from "@/component/ui/DataTable";
import PageHeader from "@/component/ui/PageHeader";
import Modal from "@/component/ui/Modal";
import ConfirmDialog from "@/component/ui/ConfirmDialog";
import LoadingSpinner from "@/component/ui/LoadingSpinner";

const teamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  linkedin: z.string().optional(),
  order: z.number().int().min(0),
});

type TeamFormData = z.infer<typeof teamSchema>;

export default function TeamPage() {
  const { token } = useAuth();
  const [members, setMembers] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMember, setDeletingMember] = useState<TeamData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: { order: 0 },
  });

  const fetchMembers = () => {
    fetchApi<TeamResponse>("/teams", {}, token ?? undefined)
      .then((res) => setMembers(res.members))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [token]);

  const openCreate = () => {
    setEditingMember(null);
    reset({ name: "", role: "", description: "", image: "", linkedin: "", order: 0 });
    setShowModal(true);
  };

  const openEdit = (member: TeamData) => {
    setEditingMember(member);
    reset({
      name: member.name,
      role: member.role,
      description: member.description ?? "",
      image: member.image ?? "",
      linkedin: member.linkedin ?? "",
      order: member.order,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: TeamFormData) => {
    setSubmitting(true);
    try {
      if (editingMember) {
        await fetchApi(
          `/teams/${editingMember._id}`,
          { method: "PUT", body: JSON.stringify(data) },
          token ?? undefined
        );
      } else {
        await fetchApi(
          "/teams",
          { method: "POST", body: JSON.stringify(data) },
          token ?? undefined
        );
      }
      setShowModal(false);
      reset();
      fetchMembers();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (member: TeamData) => {
    setDeletingMember(member);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    try {
      await fetchApi(
        `/teams/${deletingMember._id}`,
        { method: "DELETE" },
        token ?? undefined
      );
      setShowDeleteConfirm(false);
      setDeletingMember(null);
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<TeamData & Record<string, unknown>>[] = [
    {
      key: "image",
      label: "Photo",
      render: (item) => {
        const m = item as unknown as TeamData;
        return m.image ? (
          <img src={m.image} alt={m.name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22a34a]/10 text-sm font-semibold text-[#22a34a]">
            {m.name?.charAt(0).toUpperCase()}
          </div>
        );
      },
    },
    { key: "name", label: "Name", searchable: true },
    { key: "role", label: "Role" },
    {
      key: "linkedin",
      label: "LinkedIn",
      render: (item) => {
        const m = item as unknown as TeamData;
        return m.linkedin ? (
          <a
            href={m.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[#22a34a] hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    { key: "order", label: "Order" },
  ];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Manage team members"
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#22a34a] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c8a3e]"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        }
      />

      <DataTable
        data={members as unknown as (TeamData & Record<string, unknown>)[]}
        columns={columns}
        onEdit={(item) => openEdit(item as unknown as TeamData)}
        onDelete={(item) => confirmDelete(item as unknown as TeamData)}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMember ? "Edit Member" : "Add Member"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              {...register("name")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22a34a] focus:outline-none focus:ring-1 focus:ring-[#22a34a] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <input
              {...register("role")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22a34a] focus:outline-none focus:ring-1 focus:ring-[#22a34a] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22a34a] focus:outline-none focus:ring-1 focus:ring-[#22a34a] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image URL
            </label>
            <input
              {...register("image")}
              placeholder="https://example.com/photo.jpg"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22a34a] focus:outline-none focus:ring-1 focus:ring-[#22a34a] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              LinkedIn URL
            </label>
            <input
              {...register("linkedin")}
              placeholder="https://linkedin.com/in/username"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22a34a] focus:outline-none focus:ring-1 focus:ring-[#22a34a] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Order
            </label>
            <input
              type="number"
              {...register("order", { valueAsNumber: true })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22a34a] focus:outline-none focus:ring-1 focus:ring-[#22a34a] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#22a34a] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c8a3e] disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingMember ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Member"
        message={`Are you sure you want to remove "${deletingMember?.name}" from the team? This action cannot be undone.`}
      />
    </div>
  );
}
