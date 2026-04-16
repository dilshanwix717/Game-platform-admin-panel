"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadFile } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"

interface VendorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Record<string, any>) => void
  title: string
  data?: Record<string, any>
  isEdit?: boolean
}

export function VendorModal({
  isOpen,
  onClose,
  onSave,
  title,
  data,
  isEdit = false,
}: VendorModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    description: "",
    venderImageUrl: "",
    sortOrderNumber: 0,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      if (isEdit && data) {
        setFormData({
          id: data.id || "",
          name: data.name || "",
          description: data.description || "",
          venderImageUrl: data.venderImageUrl || "",
          sortOrderNumber: data.sortOrderNumber || 0,
        })
        setImagePreview(data.venderImageUrl || null)
        setUploadedImageUrl(data.venderImageUrl || null)
      } else {
        setFormData({
          name: "",
          description: "",
          venderImageUrl: "",
          sortOrderNumber: 0,
        })
        setImagePreview(null)
        setUploadedImageUrl(null)
      }
    }
  }, [isOpen, data, isEdit])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview of raw image immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setIsUploading(true)
    try {
      const response = await uploadFile(file)
      setUploadedImageUrl(response.url)
      setFormData({ ...formData, venderImageUrl: response.url })
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (err: any) {
      toast({
        title: "Failed to upload image",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      })
      setImagePreview(null)
      setUploadedImageUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setUploadedImageUrl(null)
    setFormData({ ...formData, venderImageUrl: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadedImageUrl && !isEdit && !formData.venderImageUrl) {
      toast({
        title: "Image required",
        description: "Please upload an image for the vendor",
        variant: "destructive",
      })
      return
    }
    // In edit mode, use uploadedImageUrl if new image was uploaded, otherwise keep existing
    // In create mode, use uploadedImageUrl (required)
    const finalImageUrl = uploadedImageUrl || (isEdit ? formData.venderImageUrl : "")
    const saveData: Record<string, any> = {
      ...formData,
      venderImageUrl: finalImageUrl,
    }
    // Ensure id is included in edit mode
    if (isEdit && data?.id) {
      saveData.id = data.id
    }
    onSave(saveData)
    onClose()
  }

  const displayImage = uploadedImageUrl || imagePreview

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} {title}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Edit the details below" : `Fill in the details below to create a new ${title.toLowerCase()}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vendor Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter vendor name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Vendor Image</Label>
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
                <p className="text-sm text-muted-foreground">Uploading image...</p>
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
                setFormData({ ...formData, sortOrderNumber: Number(e.target.value) || 0 })
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
  )
}

