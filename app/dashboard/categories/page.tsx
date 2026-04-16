"use client";
//app/dashboard/categories/page.tsx

// ============================================================================
// IMPORTS
// ============================================================================
// React hooks for managing component state and side effects
import { useEffect, useState } from "react";

// Custom UI components
import { DataTable } from "@/components/data-table";
import { ViewModal } from "@/components/modals/view-modal";
import { CategoryModal } from "@/components/modals/category-modal";
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

// Custom hooks and utilities
import { useToast } from "@/hooks/use-toast";

// Icons
import { Plus } from "lucide-react";

// API hooks for data fetching and mutations
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useUpdateCategoryStatus,
} from "@/lib/api/categories/queries";

// TypeScript types for type safety
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/api/categories/types";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CategoriesPage() {
  // --------------------------------------------------------------------------
  // LOCAL STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for viewing category details in a modal
  const [viewData, setViewData] = useState<any>(null);

  // State for editing a category (current edited values)
  const [editData, setEditData] = useState<any>(null);

  // State for storing original values before editing (to detect changes)
  const [originalEditData, setOriginalEditData] = useState<any>(null);

  // State for managing the status toggle confirmation dialog
  const [statusToggleData, setStatusToggleData] = useState<any>(null);

  // State for controlling the "Add Category" modal visibility
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Toast notification hook for showing success/error messages
  const { toast } = useToast();

  // --------------------------------------------------------------------------
  // DATA FETCHING & MUTATIONS (React Query hooks)
  // --------------------------------------------------------------------------
  const { data: paginatedData, isLoading } = useCategories(
    currentPage,
    itemsPerPage
  );

  // Mutation hooks for creating, updating, and changing category status
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const updateStatusMutation = useUpdateCategoryStatus();

  // --------------------------------------------------------------------------
  // SIDE EFFECTS
  // --------------------------------------------------------------------------
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Log categories whenever they change (useful for debugging)
  useEffect(() => {
    if (paginatedData) {
      console.log("Categories fetched:", paginatedData);
    }
  }, [paginatedData]);

  // --------------------------------------------------------------------------
  // DATA TRANSFORMATION
  // --------------------------------------------------------------------------
  const tableData = (paginatedData?.results ?? []).map((c: Category) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    // Use nested image URL or fallback to direct URL or empty string
    categoryImageUrl: c.categoryImage?.url ?? c.categoryImageUrl ?? "",
    sortOrderNumber: c.sortOrderNumber ?? 0,
    isActive: c.isActive ?? true,
    // Create human-readable status text
    status: c.isActive ? "Active" : "Inactive",
    // Format date to YYYY-MM-DD
    createdDate: (c.createdAt ?? new Date().toISOString()).split("T")[0],
  }));

  // --------------------------------------------------------------------------
  // TABLE COLUMN CONFIGURATION
  // --------------------------------------------------------------------------
  // Define how each column should be displayed in the table
  const columns = [
    {
      key: "categoryImageUrl",
      label: "Image",
      // Custom render function for image column
      render: (value: string) =>
        value ? (
          // Show image if URL exists
          <div className="w-12 h-12 rounded-md overflow-hidden border border-border">
            <img
              src={value || "/placeholder.svg"}
              alt="Category"
              className="w-full h-full object-cover"
              // Hide image if it fails to load
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          // Show placeholder if no image
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
      // Custom render function for status badge
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

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------

  /**
   * Handle adding a new category
   * @param data - Form data from the CategoryModal
   */
  const handleAddCategory = async (data: any) => {
    try {
      // Prepare the input object for API
      const input: CreateCategoryInput = {
        name: data.name,
        description: data.description,
        sortOrderNumber: Number(data.sortOrderNumber ?? 0),
      };

      // Only include image URL if provided (optional field)
      if (data.categoryImageUrl) {
        input.categoryImageUrl = data.categoryImageUrl;
      }

      // Call the API to create the category
      await createMutation.mutateAsync(input);

      // Show success notification
      toast({
        title: "Success",
        description: "Category created successfully",
      });

      // Close the add modal
      setIsAddOpen(false);
    } catch (err: any) {
      // Show error notification
      toast({
        title: "Failed to create category",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
      console.error("Error creating category:", err);
    }
  };

  /**
   * Handle clicking the edit button on a category row
   * @param data - The category data to edit
   */
  const handleEdit = (data: any) => {
    // Set both current edit data and original data
    // Original data is used later to detect which fields changed
    const categoryData = {
      id: data.id,
      name: data.name,
      description: data.description,
      categoryImageUrl: data.categoryImageUrl ?? "",
      sortOrderNumber: data.sortOrderNumber ?? 0,
    };

    setEditData(categoryData);
    setOriginalEditData(categoryData);
  };

  /**
   * Handle saving changes to an edited category
   * @param data - Updated form data from the CategoryModal
   */
  const handleSaveEdit = async (data: any) => {
    try {
      // Ensure we have original data to compare against
      if (!originalEditData) {
        toast({
          title: "Error",
          description: "Original data not found",
          variant: "destructive",
        });
        return;
      }

      // Build payload with only changed fields
      // This optimizes the API call by sending only what changed
      const payload: UpdateCategoryInput = {};

      if (data.name !== originalEditData.name) {
        payload.name = data.name;
      }

      if (data.description !== originalEditData.description) {
        payload.description = data.description;
      }

      // Allow empty string to clear the image URL
      if (data.categoryImageUrl !== originalEditData.categoryImageUrl) {
        payload.categoryImageUrl = data.categoryImageUrl;
      }

      if (data.sortOrderNumber !== originalEditData.sortOrderNumber) {
        payload.sortOrderNumber = Number(data.sortOrderNumber);
      }

      // If nothing changed, inform user and close modal
      if (Object.keys(payload).length === 0) {
        toast({
          title: "No changes",
          description: "No changes were made to the category",
        });
        setEditData(null);
        setOriginalEditData(null);
        return;
      }

      // Call the API to update the category
      await updateMutation.mutateAsync({
        id: String(data.id),
        data: payload,
      });

      // Show success notification
      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      // Clear edit state and close modal
      setEditData(null);
      setOriginalEditData(null);
    } catch (err: any) {
      // Show error notification
      toast({
        title: "Failed to update category",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
      console.error("Error updating category:", err);
    }
  };

  /**
   * Handle clicking the toggle status button
   * Opens a confirmation dialog before changing status
   * @param data - The category data to toggle
   */
  const handleToggleStatus = (data: any) => {
    setStatusToggleData(data);
  };

  /**
   * Handle confirming the status toggle action
   * Actually performs the status update after user confirms
   */
  const handleConfirmStatusToggle = async () => {
    try {
      // Calculate the new status (opposite of current)
      const newStatus = !statusToggleData.isActive;

      // Call the API to update the status
      await updateStatusMutation.mutateAsync({
        id: String(statusToggleData.id),
        isActive: newStatus,
      });

      // Show success notification with appropriate message
      toast({
        title: "Success",
        description: `Category ${
          newStatus ? "activated" : "deactivated"
        } successfully`,
      });

      // Close the confirmation dialog
      setStatusToggleData(null);
    } catch (err: any) {
      // Show error notification
      toast({
        title: "Failed to update category status",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        {/* Add Category Button */}
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Main Data Table */}
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

      {/* View Details Modal */}
      <ViewModal
        isOpen={!!viewData}
        onClose={() => setViewData(null)}
        title="Category Details"
        data={viewData || {}}
      />

      {/* Edit Category Modal */}
      <CategoryModal
        isOpen={!!editData}
        onClose={() => {
          setEditData(null);
          setOriginalEditData(null);
        }}
        onSave={handleSaveEdit}
        title="Category"
        data={editData || {}}
        isEdit={true}
      />

      {/* Status Toggle Confirmation Dialog */}
      <AlertDialog
        open={!!statusToggleData}
        onOpenChange={() => setStatusToggleData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusToggleData?.isActive ? "Deactivate" : "Activate"} Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {statusToggleData?.isActive ? "deactivate" : "activate"}{" "}
              <span className="font-semibold">{statusToggleData?.name}</span>?
              {statusToggleData?.isActive &&
                " This will hide the category from active listings."}
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

      {/* Add Category Modal */}
      <CategoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddCategory}
        title="Category"
        isEdit={false}
      />
    </div>
  );
}
