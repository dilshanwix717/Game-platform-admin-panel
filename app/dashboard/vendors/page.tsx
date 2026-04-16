"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ViewModal } from "@/components/modals/view-modal";
import { VendorModal } from "@/components/modals/vendor-modal";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useUpdateVendorStatus,
} from "@/lib/api/vendors/queries";
import type {
  Vendor,
  CreateVendorInput,
  UpdateVendorInput,
} from "@/lib/api/vendors/types";

export default function VendorsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [viewData, setViewData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [originalEditData, setOriginalEditData] = useState<any>(null);
  const [statusToggleData, setStatusToggleData] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { toast } = useToast();

  const { data: paginatedData, isLoading } = useVendors(
    currentPage,
    itemsPerPage
  );

  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const updateStatusMutation = useUpdateVendorStatus();

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    if (paginatedData) {
      console.log("Vendors fetched:", paginatedData);
    }
  }, [paginatedData]);

  const tableData = (paginatedData?.results ?? []).map((v: Vendor) => ({
    id: v.id,
    name: v.name,
    description: v.description,
    venderImageUrl: v.venderImage?.url ?? v.venderImageUrl ?? "",
    sortOrderNumber: v.sortOrderNumber ?? 0,
    isActive: v.isActive ?? true,
    status: v.isActive ? "Active" : "Inactive",
    createdDate: (v.createdAt ?? new Date().toISOString()).split("T")[0],
  }));

  const columns = [
    {
      key: "venderImageUrl",
      label: "Image",
      render: (value: string) =>
        value ? (
          <div className="w-12 h-12 rounded-md overflow-hidden border border-border">
            <img
              src={value || "/placeholder.svg"}
              alt="Vendor"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-md border border-border bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        ),
    },
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
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

  const handleAddVendor = async (data: any) => {
    try {
      const input: CreateVendorInput = {
        name: data.name,
        description: data.description,
        sortOrderNumber: Number(data.sortOrderNumber ?? 0),
      };

      if (data.venderImageUrl) {
        input.venderImageUrl = data.venderImageUrl;
      }

      await createMutation.mutateAsync(input);

      toast({
        title: "Success",
        description: "Vendor created successfully",
      });

      setIsAddOpen(false);
    } catch (err: any) {
      toast({
        title: "Failed to create vendor",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
      console.error("Error creating vendor:", err);
    }
  };

  const handleEdit = (data: any) => {
    const vendorData = {
      id: data.id,
      name: data.name,
      description: data.description,
      venderImageUrl: data.venderImageUrl ?? "",
      sortOrderNumber: data.sortOrderNumber ?? 0,
    };

    setEditData(vendorData);
    setOriginalEditData(vendorData);
  };

  const handleSaveEdit = async (data: any) => {
    try {
      if (!originalEditData) {
        toast({
          title: "Error",
          description: "Original data not found",
          variant: "destructive",
        });
        return;
      }

      const payload: UpdateVendorInput = {};

      if (data.name !== originalEditData.name) {
        payload.name = data.name;
      }

      if (data.description !== originalEditData.description) {
        payload.description = data.description;
      }

      if (data.venderImageUrl !== originalEditData.venderImageUrl) {
        payload.venderImageUrl = data.venderImageUrl;
      }

      if (data.sortOrderNumber !== originalEditData.sortOrderNumber) {
        payload.sortOrderNumber = Number(data.sortOrderNumber);
      }

      if (Object.keys(payload).length === 0) {
        toast({
          title: "No changes",
          description: "No changes were made to the vendor",
        });
        setEditData(null);
        setOriginalEditData(null);
        return;
      }

      await updateMutation.mutateAsync({
        id: String(data.id),
        data: payload,
      });

      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });

      setEditData(null);
      setOriginalEditData(null);
    } catch (err: any) {
      toast({
        title: "Failed to update vendor",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
      console.error("Error updating vendor:", err);
    }
  };

  const handleToggleStatus = (data: any) => {
    setStatusToggleData(data);
  };

  const handleConfirmStatusToggle = async () => {
    try {
      const newStatus = !statusToggleData.isActive;

      await updateStatusMutation.mutateAsync({
        id: String(statusToggleData.id),
        isActive: newStatus,
      });

      toast({
        title: "Success",
        description: `Vendor ${
          newStatus ? "activated" : "deactivated"
        } successfully`,
      });

      setStatusToggleData(null);
    } catch (err: any) {
      toast({
        title: "Failed to update vendor status",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">Manage vendor accounts</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        onView={setViewData}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        searchKey="name"
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
        title="Vendor Details"
        data={viewData || {}}
      />

      <VendorModal
        isOpen={!!editData}
        onClose={() => {
          setEditData(null);
          setOriginalEditData(null);
        }}
        onSave={handleSaveEdit}
        title="Vendor"
        data={editData || {}}
        isEdit={true}
      />

      <AlertDialog
        open={!!statusToggleData}
        onOpenChange={() => setStatusToggleData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusToggleData?.isActive ? "Deactivate" : "Activate"} Vendor
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {statusToggleData?.isActive ? "deactivate" : "activate"}{" "}
              <span className="font-semibold">{statusToggleData?.name}</span>?
              {statusToggleData?.isActive &&
                " This will hide the vendor from active listings."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusToggle}>
              {statusToggleData?.isActive ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VendorModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddVendor}
        title="Vendor"
        isEdit={false}
      />
    </div>
  );
}
