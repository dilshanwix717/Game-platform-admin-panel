// FILE: components/modals/view-modal.tsx (or wherever ViewModal is)
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any>;
  isLoading?: boolean;
}

export function ViewModal({
  isOpen,
  onClose,
  title,
  data,
  isLoading,
}: ViewModalProps) {
  const imageUrl =
    data?.thumbnailImage?.url ||
    data.thumbnailImageUrl ||
    data.categoryImageUrl ||
    data.venderImageUrl ||
    null;

  // Helper to render category names
  const categoryNames = Array.isArray(data?.categories)
    ? (data.categories as Array<any>).map((c) => c.name).filter(Boolean)
    : [];
  console.log("ViewModal data in modal:", data);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>View full details</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground capitalize">
                {imageUrl ? "Thumbnail" : "Image"}
              </label>
              {imageUrl ? (
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-border mx-auto">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const parent = (e.target as HTMLImageElement)
                        .parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-muted flex items-center justify-center">
                            <span class="text-xs text-muted-foreground">Failed to load</span>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border border-border bg-muted flex items-center justify-center mx-auto">
                  <span className="text-sm text-muted-foreground">
                    No image
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-sm font-medium">{data?.name ?? "-"}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-sm font-medium">{data?.description ?? "-"}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Play Link
              </label>
              {data?.playLink ? (
                <a
                  href={String(data.playLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline break-all"
                >
                  {String(data.playLink)}
                </a>
              ) : (
                <p className="text-sm font-medium">-</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Sort Order
                </label>
                <p className="text-sm font-medium">
                  {data?.sortOrderNumber ?? "-"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <p className="text-sm font-medium">
                  {data?.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Vendor
              </label>
              <p className="text-sm font-medium">
                {data?.vender?.name ?? data?.venderName ?? "-"}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Categories
              </label>
              {categoryNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categoryNames.map((n) => (
                    <span
                      key={n}
                      className="text-xs px-2 py-1 rounded bg-muted"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium">-</p>
              )}
            </div>
          </div>
        )}

        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
