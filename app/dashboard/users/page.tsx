"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { ViewModal } from "@/components/modals/view-modal";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/lib/api/users/queries";
import type { User } from "@/lib/api/users/types";

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewData, setViewData] = useState<any>(null);

  const { toast } = useToast();
  const { data: paginatedData, isLoading } = useUsers(
    currentPage,
    itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const tableData = (paginatedData?.results ?? []).map((u: User) => ({
    id: u.id,
    email: u.email,
    phoneNumber: u.phoneNumber ?? "",
    profileImageUrl: u.profileImage?.url ?? u.profileImageUrl ?? "",
    role: u.role ?? "User",
    isActive: u.isActive ?? true,
    status: u.isActive ? "Active" : "Inactive",
    createdDate: (u.createdAt ?? new Date().toISOString()).split("T")[0],
  }));

  const columns = [
    {
      key: "profileImageUrl",
      label: "Profile",
      render: (value: string) =>
        value ? (
          <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
            <img
              src={value || "/placeholder.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full border border-border bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        ),
    },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    { key: "createdDate", label: "Created Date" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">View user accounts</p>
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        onView={setViewData}
        searchKey="email"
        isLoading={isLoading}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={paginatedData?.count ?? 0}
      />

      <ViewModal
        isOpen={!!viewData}
        onClose={() => setViewData(null)}
        title="User Details"
        data={viewData || {}}
      />
    </div>
  );
}
