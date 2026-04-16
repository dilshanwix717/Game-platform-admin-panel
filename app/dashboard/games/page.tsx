"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ViewModal } from "@/components/modals/view-modal";
import { GameModal } from "@/components/modals/game-modal";
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
  useGame,
  useGames,
  useCreateGame,
  useUpdateGame,
  useUpdateGameStatus,
} from "@/lib/api/games/queries";
import type {
  Game,
  CreateGameInput,
  UpdateGameInput,
} from "@/lib/api/games/types";

export default function GamesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewId, setViewId] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [originalEditData, setOriginalEditData] = useState<any>(null);
  const [statusToggleData, setStatusToggleData] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { toast } = useToast();
  const { data: viewGame, isLoading: isViewLoading } = useGame(viewId);
  console.log("View Game Data:", viewGame);
  const { data: paginatedData, isLoading } = useGames(
    currentPage,
    itemsPerPage
  );

  const { data: fullGameData, isLoading: isFullGameLoading } = useGame(editId);

  const createMutation = useCreateGame();
  const updateMutation = useUpdateGame();
  const updateStatusMutation = useUpdateGameStatus();

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    if (paginatedData) {
      console.log("Games fetched:", paginatedData);
    }
  }, [paginatedData]);

  useEffect(() => {
    if (editId && fullGameData && !originalEditData) {
      const normalizedCategoryIds = (
        fullGameData.categoryIds ||
        fullGameData.categories?.map((c: any) => c.id) ||
        []
      )
        .map((id: any) => String(id))
        .sort();

      const vendorId =
        fullGameData.venderId || (fullGameData.vender?.id ?? null);

      setOriginalEditData({
        id: fullGameData.id,
        name: fullGameData.name,
        description: fullGameData.description,
        thumbnailImageUrl:
          fullGameData.thumbnailImageUrl ||
          fullGameData.thumbnailImage?.url ||
          "",
        playLink: fullGameData.playLink,
        sortOrderNumber: fullGameData.sortOrderNumber ?? 0,
        venderId: vendorId ? String(vendorId) : null,
        categoryIds: normalizedCategoryIds,
      });
    }
  }, [editId, fullGameData, originalEditData]);

  const tableData = (paginatedData?.results ?? []).map((g: Game) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    thumbnailImageUrl: g.thumbnailImage?.url ?? g.thumbnailImageUrl ?? "",
    playLink: g.playLink,
    sortOrderNumber: g.sortOrderNumber ?? 0,
    isActive: g.isActive ?? true,
    status: g.isActive ? "Active" : "Inactive",
    venderId: g.venderId,
    categoryIds: g.categoryIds || [],
    createdDate: (g.createdAt ?? new Date().toISOString()).split("T")[0],
  }));

  const columns = [
    {
      key: "thumbnailImageUrl",
      label: "Thumbnail",
      render: (value: string) =>
        value ? (
          <div className="w-12 h-12 rounded-md overflow-hidden border border-border">
            <img
              src={value || "/placeholder.svg"}
              alt="Game"
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
    { key: "playLink", label: "Play Link" },
  ];

  const handleAddGame = async (data: any) => {
    try {
      const input: CreateGameInput = {
        name: data.name,
        description: data.description,
        playLink: data.playLink,
        sortOrderNumber: Number(data.sortOrderNumber ?? 0),
      };

      if (data.thumbnailImageUrl) {
        input.thumbnailImageUrl = data.thumbnailImageUrl;
      }

      if (data.venderId) {
        input.venderId = data.venderId;
      }

      if (data.categoryIds?.length > 0) {
        input.categoryIds = data.categoryIds;
      }

      await createMutation.mutateAsync(input);

      toast({
        title: "Success",
        description: "Game created successfully",
      });

      setIsAddOpen(false);
    } catch (err: any) {
      toast({
        title: "Failed to create game",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
      console.error("Error creating game:", err);
    }
  };

  const handleEdit = (data: any) => {
    setEditId(String(data.id));
    setOriginalEditData(null); // Reset to allow useEffect to populate from fullGameData
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

      const payload: UpdateGameInput = {};

      if (data.name !== originalEditData.name) {
        payload.name = data.name;
      }

      if (data.description !== originalEditData.description) {
        payload.description = data.description;
      }

      if (data.playLink !== originalEditData.playLink) {
        payload.playLink = data.playLink;
      }

      if (data.thumbnailImageUrl !== originalEditData.thumbnailImageUrl) {
        payload.thumbnailImageUrl = data.thumbnailImageUrl;
      }

      if (data.sortOrderNumber !== originalEditData.sortOrderNumber) {
        payload.sortOrderNumber = Number(data.sortOrderNumber);
      }

      const originalVenderId = originalEditData.venderId
        ? String(originalEditData.venderId)
        : null;
      const newVenderId = data.venderId ? String(data.venderId) : null;
      if (newVenderId !== originalVenderId) {
        payload.venderId = newVenderId;
      }

      const originalCategoryIds = (originalEditData.categoryIds || [])
        .map((id: any) => String(id))
        .sort();
      const newCategoryIds = (data.categoryIds || [])
        .map((id: any) => String(id))
        .sort();
      if (
        JSON.stringify(originalCategoryIds) !== JSON.stringify(newCategoryIds)
      ) {
        payload.categoryIds = newCategoryIds;
      }

      if (Object.keys(payload).length === 0) {
        toast({
          title: "No changes",
          description: "No changes were made to the game",
        });
        setEditId(null);
        setOriginalEditData(null);
        return;
      }

      console.log("Updating game with payload:", payload);
      await updateMutation.mutateAsync({
        id: String(data.id),
        data: payload,
      });

      toast({
        title: "Success",
        description: "Game updated successfully",
      });

      setEditId(null);
      setOriginalEditData(null);
    } catch (err: any) {
      toast({
        title: "Failed to update game",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
      console.error("Error updating game:", err);
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
        description: `Game ${
          newStatus ? "activated" : "deactivated"
        } successfully`,
      });

      setStatusToggleData(null);
    } catch (err: any) {
      toast({
        title: "Failed to update game status",
        description: err?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Games</h1>
          <p className="text-muted-foreground">Manage game inventory</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Game
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        onView={(row) => {
          setViewId(String(row.id));
        }}
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
        isOpen={!!viewId}
        onClose={() => setViewId(null)}
        title="Game Details"
        data={viewGame || {}}
        isLoading={isViewLoading}
      />

      <GameModal
        isOpen={!!editId}
        onClose={() => {
          setEditId(null);
          setOriginalEditData(null);
        }}
        onSave={handleSaveEdit}
        title="Game"
        data={fullGameData || {}}
        isEdit={true}
        //isLoading={isFullGameLoading}
      />

      <AlertDialog
        open={!!statusToggleData}
        onOpenChange={() => setStatusToggleData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusToggleData?.isActive ? "Deactivate" : "Activate"} Game
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {statusToggleData?.isActive ? "deactivate" : "activate"}{" "}
              <span className="font-semibold">{statusToggleData?.name}</span>?
              {statusToggleData?.isActive &&
                " This will hide the game from active listings."}
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

      <GameModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddGame}
        title="Game"
        isEdit={false}
      />
    </div>
  );
}
