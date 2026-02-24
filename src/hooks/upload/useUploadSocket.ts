import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { GalleryItem, WSStatusUpdate } from "../../types/upload";


export const useUploadSocket = () => {
  const queryClient = useQueryClient();

  const handleUpdate = useCallback(
    (update: WSStatusUpdate) => {

      console.log("Received WS update:", update);

      queryClient.setQueryData(
        ["upload", "recent-gallery"],
        (oldData: GalleryItem[]) => {
          if (!oldData) return oldData;
          return oldData.map((item) =>
            item.id === update.media_id
              ? {
                  ...item,
                  status: update.status,
                  image_url: update.image_url ?? item.image_url,
                }
              : item,
          );
        },
      );

      // also update vault data if it exists
      queryClient.setQueryData(
        ["vault"],
        (oldData: { items: GalleryItem[] } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === update.media_id
                ? {
                    ...item,
                    status: update.status,
                    image_url: update.image_url ?? item.image_url,
                    assigned_worker: update.worker ?? item.assigned_worker,
                  }
                : item,
            ),
          };
        },
      );

      if (update.status === "UPLOADED" || update.status === "READY") {
        queryClient.invalidateQueries({
          queryKey: ["upload", "recent-gallery"],
        });
        queryClient.invalidateQueries({
          queryKey: ["vault"],
        });
      }
    },
    [queryClient],
  );

  useEffect(() => {
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;
    const wsUrl = new URL(apiBaseUrl);
    wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
    wsUrl.pathname = `${wsUrl.pathname.replace(/\/$/, "")}/upload/ws/updates`;
    wsUrl.search = "";

    const socket = new WebSocket(wsUrl.toString());

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSStatusUpdate;
        if (data.type === "MEDIA_STATUS_UPDATE") {
          handleUpdate(data);
        }
      } catch (err) {
        console.error("WS parsing error", err);
      }
    };

    return () => socket.close();
  }, [handleUpdate]);
};
