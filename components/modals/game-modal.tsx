"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

// React Query hooks (replacing direct API-client usage)
import { useVendors } from "@/lib/api/vendors/queries";
import { useCategories } from "@/lib/api/categories/queries";
import { useUploadFile } from "@/lib/api/files/queries";

import { useGame } from "@/lib/api/games/queries";

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  title: string;
  data?: Record<string, any>;
  isEdit?: boolean;
}

export function GameModal({
  isOpen,
  onClose,
  onSave,
  title,
  data,
  isEdit = false,
}: GameModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    description: "",
    thumbnailImageUrl: "",
    playLink: "",
    sortOrderNumber: 0,
    venderId: "",
    categoryIds: [] as string[],
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // react-query hooks
  const vendorsQuery = useVendors(1, 1000); // fetch many so modal dropdown has full list
  const categoriesQuery = useCategories(1, 1000);
  const uploadMutation = useUploadFile();

  // Fetch full game details when editing (useGame uses react-query & is enabled only with id)
  const { data: fullGame, isLoading: isFullGameLoading } = useGame(
    isEdit && data?.id ? String(data.id) : undefined
  );

  // Sync query results into local state used by the form UI
  useEffect(() => {
    setIsLoadingOptions(vendorsQuery.isLoading || categoriesQuery.isLoading);
  }, [vendorsQuery.isLoading, categoriesQuery.isLoading]);

  useEffect(() => {
    const vendorResults = vendorsQuery.data?.results ?? [];
    setVendors(Array.isArray(vendorResults) ? vendorResults : []);
  }, [vendorsQuery.data]);

  useEffect(() => {
    const categoryResults = categoriesQuery.data?.results ?? [];
    setCategories(Array.isArray(categoryResults) ? categoryResults : []);
  }, [categoriesQuery.data]);

  useEffect(() => {
    if (isOpen) {
      // For create mode, initialize blank form (for edit we wait for fullGame effect)
      if (!isEdit) {
        setFormData({
          name: "",
          description: "",
          thumbnailImageUrl: "",
          playLink: "",
          sortOrderNumber: 0,
          venderId: "",
          categoryIds: [],
        });
        setImagePreview(null);
        setUploadedImageUrl(null);
      }
    } else {
      // Reset form when modal closes
      setFormData({
        name: "",
        description: "",
        thumbnailImageUrl: "",
        playLink: "",
        sortOrderNumber: 0,
        venderId: "",
        categoryIds: [],
      });
      setImagePreview(null);
      setUploadedImageUrl(null);
    }
  }, [isOpen, isEdit]);

  // When fullGame and options are available, populate form for edit mode
  useEffect(() => {
    if (!isOpen || !isEdit || !fullGame) return;

    // derive categoryIds from categoryIds OR categories array
    let normalizedCategoryIds: string[] = [];
    if (
      Array.isArray(fullGame.categoryIds) &&
      fullGame.categoryIds.length > 0
    ) {
      normalizedCategoryIds = fullGame.categoryIds.map((id: any) => String(id));
    } else if (
      Array.isArray(fullGame.categories) &&
      fullGame.categories.length > 0
    ) {
      normalizedCategoryIds = fullGame.categories.map((c: any) => String(c.id));
    }

    const thumbnail =
      fullGame.thumbnailImageUrl ??
      (fullGame.thumbnailImage && fullGame.thumbnailImage.url) ??
      "";

    const vendorId =
      fullGame.venderId ?? (fullGame.vender && fullGame.vender.id) ?? "";

    setFormData({
      id: fullGame.id ?? "",
      name: fullGame.name ?? "",
      description: fullGame.description ?? "",
      thumbnailImageUrl: thumbnail,
      playLink: fullGame.playLink ?? "",
      sortOrderNumber: fullGame.sortOrderNumber ?? 0,
      venderId: vendorId ? String(vendorId) : "",
      categoryIds: normalizedCategoryIds,
    });
    setImagePreview(thumbnail || null);
    setUploadedImageUrl(thumbnail || null);
  }, [isOpen, isEdit, fullGame]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview of raw image immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server using react-query mutation
    try {
      // Use a local uploading flag while awaiting mutateAsync to keep UI responsive
      setIsLoadingOptions((s) => s); // no-op to satisfy linter; real uploading flag below
      const response = await uploadMutation.mutateAsync(file);
      // Assume response has { url: string } shape (same as previous uploadFile)
      setUploadedImageUrl(response.url);
      setFormData((prev) => ({ ...prev, thumbnailImageUrl: response.url }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (err: any) {
      toast({
        title: "Failed to upload image",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
      setImagePreview(null);
      setUploadedImageUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
    setFormData({ ...formData, thumbnailImageUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentIds = formData.categoryIds || [];
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter((id: string) => id !== categoryId)
      : [...currentIds, categoryId];
    setFormData({ ...formData, categoryIds: newIds });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //const isUploading = uploadMutation.isLoading;
    if (!uploadedImageUrl && !isEdit && !formData.thumbnailImageUrl) {
      toast({
        title: "Image required",
        description: "Please upload a thumbnail image for the game",
        variant: "destructive",
      });
      return;
    }
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      toast({
        title: "Categories required",
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }
    // Normalize play link - add https:// if no protocol is provided
    let playLink = String(formData.playLink || "").trim();
    if (playLink && !playLink.match(/^https?:\/\//i)) {
      playLink = `https://${playLink}`;
    }

    // In edit mode, use uploadedImageUrl if new image was uploaded, otherwise keep existing
    // In create mode, use uploadedImageUrl (required)
    const finalImageUrl =
      uploadedImageUrl || (isEdit ? formData.thumbnailImageUrl : "");
    const saveData: Record<string, any> = {
      ...formData,
      thumbnailImageUrl: finalImageUrl,
      playLink: playLink,
      venderId: formData.venderId || undefined, // Remove empty string
      // ensure categoryIds are strings
      categoryIds: (formData.categoryIds || []).map((id: any) => String(id)),
    };
    // Ensure id is included in edit mode
    if (isEdit && data?.id) {
      saveData.id = data.id;
    }
    onSave(saveData);
    onClose();
  };

  const displayImage = uploadedImageUrl || imagePreview;
  // Normalize categoryIds to strings for comparison
  const selectedCategoryIds = (formData.categoryIds || []).map((id: any) =>
    String(id)
  );

  // derive lists from query-backed local state
  const vendorList = vendors;
  const categoryList = categories;

  //const isUploading = uploadMutation.isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit" : "Add"} {title}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Edit the details below"
              : `Fill in the details below to create a new ${title.toLowerCase()}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Game Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter game name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Thumbnail Image</Label>
            <div className="space-y-2">
              <Input
                id="image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                // disabled={isUploading}
                className="cursor-pointer"
              />
              {/* {isUploading && (
                <p className="text-sm text-muted-foreground">
                  Uploading image...
                </p>
              )} */}
              {displayImage && (
                <div className="relative w-full h-48 border rounded-md overflow-hidden">
                  <img
                    src={displayImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="playLink">Play Link</Label>
            <Input
              id="playLink"
              type="text"
              placeholder="Enter play link (e.g., https://example.com/play or www.example.com)"
              value={formData.playLink}
              onChange={(e) =>
                setFormData({ ...formData, playLink: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrderNumber">Sort Order</Label>
            <Input
              id="sortOrderNumber"
              type="number"
              placeholder="Enter sort order"
              value={formData.sortOrderNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrderNumber: Number(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venderId">Vendor (Optional)</Label>
            <Select
              value={formData.venderId ? String(formData.venderId) : undefined}
              onValueChange={(value) =>
                setFormData({ ...formData, venderId: value })
              }
              disabled={isLoadingOptions}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a vendor (optional)" />
              </SelectTrigger>
              <SelectContent>
                {vendorList
                  .filter((v) => v.isActive !== false)
                  .map((vendor) => (
                    <SelectItem key={vendor.id} value={String(vendor.id)}>
                      {vendor.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {formData.venderId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData({ ...formData, venderId: "" })}
                className="h-6 text-xs"
              >
                Clear selection
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Categories (Select at least one)</Label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
              {isLoadingOptions ? (
                <p className="text-sm text-muted-foreground">
                  Loading categories...
                </p>
              ) : categoryList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No categories available
                </p>
              ) : (
                categoryList
                  .filter((c) => c.isActive !== false)
                  .map((category) => {
                    const categoryIdStr = String(category.id);
                    return (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategoryIds.includes(categoryIdStr)}
                          onCheckedChange={() =>
                            handleCategoryToggle(categoryIdStr)
                          }
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    );
                  })
              )}
            </div>
            {selectedCategoryIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedCategoryIds.length} categor
                {selectedCategoryIds.length === 1 ? "y" : "ies"} selected
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              // disabled={
              //   isUploading || isLoadingOptions || (isEdit && isFullGameLoading)
              // }
            >
              {isEdit ? "Save" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              // disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
