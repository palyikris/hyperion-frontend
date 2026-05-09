// src/hooks/upload/useUploadSocket.ts

import { useEffect, useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { GalleryItem, WSStatusUpdate } from "../../types/upload";
import { toastService } from "../../services/toastService";
import type { VideoDetectionResponse } from "../../types/lab";

interface VaultCacheData {
  total: number;
  image_items: GalleryItem[];
  video_items: VideoDetectionResponse[];
}

export const useUploadSocket = () => {
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>(0);
  const reconnectAttempts = useRef(0);
  const [liveFailureAnnouncement, setLiveFailureAnnouncement] = useState("");

  const handleUpdate = useCallback(
    (update: WSStatusUpdate) => {
      queryClient.setQueryData(
        ["upload", "recent-gallery"],
        (oldData: VaultCacheData | undefined) => {
          if (!oldData || !oldData.image_items) return oldData;
          return {
            ...oldData,
            image_items: oldData.image_items.map((item) =>
              item.id === update.media_id
                ? {
                    ...item,
                    status: update.status,
                    failed_reason:
                      update.status === "FAILED"
                        ? (update.failed_reason ?? item.failed_reason)
                        : undefined,
                    image_url: update.image_url ?? item.hf_path,
                  }
                : item,
            ),
            video_items: oldData.video_items || [],
          };
        },
      );

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["vault"] })
        .forEach((query) => {
          queryClient.setQueryData(
            query.queryKey,
            (oldData: VaultCacheData | undefined) => {
              if (!oldData || !oldData.image_items) return oldData;
              return {
                ...oldData,
                image_items: oldData.image_items.map((item) =>
                  item.id === update.media_id
                    ? {
                        ...item,
                        status: update.status,
                        failed_reason:
                          update.status === "FAILED"
                            ? (update.failed_reason ?? item.failed_reason)
                            : undefined,
                        image_url: update.image_url ?? item.hf_path,
                        assigned_worker: update.worker ?? item.assigned_worker,
                        address: update.address ?? item.address,
                      }
                    : item,
                ),
                video_items: oldData.video_items || [],
              };
            },
          );
        });

      if (update.status === "FAILED") {
        const reason = update.failed_reason?.trim() || "Processing failed.";
        toastService.error("Media processing failed", reason);
        setLiveFailureAnnouncement(`Media processing failed: ${reason}`);
      }

      if (update.status === "READY" || update.status === "FAILED") {
        queryClient.invalidateQueries({
          queryKey: ["upload", "recent-gallery"],
        });
        queryClient.invalidateQueries({ queryKey: ["vault"] });
      }
    },
    [queryClient],
  );

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;
    const wsUrl = new URL(apiBaseUrl);
    wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
    wsUrl.pathname = `${wsUrl.pathname.replace(/\/$/, "")}/upload/ws/updates`;

    const socket = new WebSocket(wsUrl.toString());
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WS Connected");
      reconnectAttempts.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSStatusUpdate;
        if (data.type === "MEDIA_STATUS_UPDATE") {
          handleUpdate(data);
        }
      } catch (err) {
        console.error("WS Parsing error", err);
      }
    };

    socket.onclose = (event) => {
      if (event.wasClean) return;

      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttempts.current),
        30000,
      );
      console.log(`WS Disconnected. Retrying in ${delay / 1000}s...`);

      reconnectTimeoutRef.current = window.setTimeout(() => {
        reconnectAttempts.current++;
        connect();
      }, delay);
    };

    socket.onerror = () => socket.close();
  }, [handleUpdate]);

  useEffect(() => {
    connect();
    return () => {
      window.clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.onclose = null; // prevent looping
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { liveFailureAnnouncement };
};
