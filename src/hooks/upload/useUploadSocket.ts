// src/hooks/upload/useUploadSocket.ts

import { useEffect, useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { GalleryItem, WSStatusUpdate } from "../../types/upload";
import { toastService } from "../../services/toastService";
import type { VideoDetectionResponse } from "../../types/lab";
import i18n from "i18next";
import { api } from "../../api/axiosInstance";

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
  const hasConnected = useRef(false);
  const [liveFailureAnnouncement, setLiveFailureAnnouncement] = useState("");

  const invalidateDependentQueries = useCallback(() => {
    for (const queryKey of [
      ["upload", "recent-gallery"], ["vault"], ["map-data"],
      ["map-logs"], ["stats"], ["media"], ["video"],
    ]) {
      void queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient]);

  const handleUpdate = useCallback(
    (update: WSStatusUpdate) => {
      const updateCache = (oldData: VaultCacheData | undefined) => {
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
                    hf_path: update.img_url ?? item.hf_path,
                    assigned_worker: update.worker ?? item.assigned_worker,
                    address: update.address ?? item.address,
                  }
                : item,
            ),
            video_items: oldData.video_items || [],
          };
        };
      queryClient.setQueryData(["upload", "recent-gallery"], updateCache);

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["vault"] })
        .forEach((query) => {
          queryClient.setQueryData(query.queryKey, updateCache);
        });

      if (update.status === "FAILED") {
        const reason = update.failed_reason?.trim()
          || i18n.t("upload.toast.processingErrorFallback");
        toastService.error(i18n.t("upload.toast.processingErrorTitle"), reason);
        setLiveFailureAnnouncement(
          i18n.t("upload.toast.processingErrorAnnouncement", { reason }),
        );
      }

      if (update.status === "READY" || update.status === "FAILED") {
        invalidateDependentQueries();
      }
    },
    [queryClient, invalidateDependentQueries],
  );

  const connect = useCallback(function connect() {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = new URL(api.defaults.baseURL || "/api", window.location.origin);
    wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
    wsUrl.pathname = `${wsUrl.pathname.replace(/\/$/, "")}/upload/ws/updates`;

    const socket = new WebSocket(wsUrl.toString());
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WS Connected");
      reconnectAttempts.current = 0;
      if (hasConnected.current) invalidateDependentQueries();
      hasConnected.current = true;
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
      // A normal server restart may complete the closing handshake cleanly.
      // Authentication denial is terminal; other closures should reconnect.
      if (event.code === 1008) return;

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
  }, [handleUpdate, invalidateDependentQueries]);

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
