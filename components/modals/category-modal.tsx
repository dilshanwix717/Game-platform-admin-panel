// FILE: components/modals/category-modal.tsx
// Updated CategoryModal component using the new file upload hook

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
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { useUploadFile } from "@/lib/api/files/queries";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  title: string;
  data?: Record<string, any>;
  isEdit?: boolean;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  title,
  data,
  isEdit = false,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    description: "",
    categoryImageUrl: "",
    sortOrderNumber: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Use the new file upload hook
  const uploadMutation = useUploadFile();

  useEffect(() => {
    if (isOpen) {
      if (isEdit && data) {
        setFormData({
          id: data.id || "",
          name: data.name || "",
          description: data.description || "",
          categoryImageUrl: data.categoryImageUrl || "",
          sortOrderNumber: data.sortOrderNumber || 0,
        });
        setImagePreview(data.categoryImageUrl || null);
        setUploadedImageUrl(data.categoryImageUrl || null);
      } else {
        setFormData({
          name: "",
          description: "",
          categoryImageUrl: "",
          sortOrderNumber: 0,
        });
        setImagePreview(null);
        setUploadedImageUrl(null);
      }
    }
  }, [isOpen, data, isEdit]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview of raw image immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server using the mutation
    try {
      const response = await uploadMutation.mutateAsync(file);
      setUploadedImageUrl(response.url);
      setFormData((prev) => ({ ...prev, categoryImageUrl: response.url }));
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
      setFormData((prev) => ({ ...prev, categoryImageUrl: "" }));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
    setFormData({ ...formData, categoryImageUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalImageUrl = uploadedImageUrl ?? formData.categoryImageUrl ?? "";

    const saveData: Record<string, any> = {
      ...formData,
    };

    if (finalImageUrl) {
      saveData.categoryImageUrl = finalImageUrl;
    } else {
      if (isEdit) {
        saveData.categoryImageUrl = "";
      } else {
        delete saveData.categoryImageUrl;
      }
    }

    if (isEdit && data?.id) {
      saveData.id = data.id;
    }

    if (saveData.sortOrderNumber !== undefined) {
      saveData.sortOrderNumber = Number(saveData.sortOrderNumber || 0);
    }

    onSave(saveData);
    onClose();
  };

  const displayImage = uploadedImageUrl || imagePreview;
  const isUploading = uploadMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter category name"
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
            <Label htmlFor="image">Category Image (optional)</Label>
            <div className="space-y-2">
              <Input
                id="image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
                className="cursor-pointer"
              />
              {isUploading && (
                <p className="text-sm text-muted-foreground">
                  Uploading image...
                </p>
              )}
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

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isUploading}>
              {isEdit ? "Save" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
