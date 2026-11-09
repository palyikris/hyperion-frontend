import { useTranslation } from "react-i18next";
import { Title } from "../components/shared/Title";
import { useParams } from "react-router-dom";
import { useGetCombinedMedia } from "../hooks/lab/useGetCombinedMedia";
import { useIsMutating } from "@tanstack/react-query";
import LoadingScreen from "../components/shared/LoadingScreen";
import MiniMap from "../components/features/lab/MiniMap";
import LocationForm from "../components/features/lab/LocationForm";
import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, MapPinned } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLabMetadataSchema,
  type LabMetadataFormData,
} from "../schemas/lab/media";
import { useUpdateMedia } from "../hooks/lab/useUpdateMedia";
import type {
  MediaPatchRequest,
  MediaResponse,
  VideoDetectionResponse,
} from "../types/lab";
import Divider from "../components/shared/Divider";
import DetectionsDisplay from "../components/features/lab/DetectionsDisplay";
import { PageAtmosphere } from "../components/shared/decoration";
import { Button } from "../components/shared/Button";
import { toastService } from "../services/toastService";

type CombinedMediaData = MediaResponse | VideoDetectionResponse;

const LabPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data, isPending, isNotFound, retry } = useGetCombinedMedia(id);
  if (isPending) return <LoadingScreen />;
  if (!data || !id) {
    return <div className="p-8 space-y-4" role="alert">
      <p>{t(isNotFound ? "lab.page.not_found" : "lab.page.load_error")}</p>
      <Button text={t("lab.page.retry")} onClick={() => { void retry(); }} />
    </div>;
  }
  return <LabEditor key={id} id={id} data={data} />;
};

const LabEditor = ({ id, data }: { id: string; data: CombinedMediaData }) => {
  const { t } = useTranslation();
  const isSaving = useIsMutating({ mutationKey: ["lab", "update", id] }) > 0;
  const itemType = data
    ? "detections" in data
      ? "image"
      : "video"
    : "image";

  const updateMediaMutation = useUpdateMedia(id);
  const metadataSchema = useMemo(() => createLabMetadataSchema(t), [t]);
  const [locating, setLocating] = useState(false);
  const locationRequest = useRef<symbol | null>(null);

  useEffect(() => () => {
    locationRequest.current = null;
  }, []);

  const {
    control,
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting, dirtyFields },
  } = useForm<LabMetadataFormData>({
    resolver: zodResolver(metadataSchema),
    mode: "onBlur",
    defaultValues: {
      lat: data?.lat,
      lng: data?.lng,
      altitude: data?.altitude,
    },
  });

  useEffect(() => {
    reset({
      lat: data.lat ?? undefined,
      lng: data.lng ?? undefined,
      altitude: data.altitude ?? undefined,
    }, { keepDirtyValues: true });
  }, [data.lat, data.lng, data.altitude, reset]);

  const draftLat = useWatch({ control, name: "lat" });
  const draftLng = useWatch({ control, name: "lng" });
  const hasDraftCoordinates =
    typeof draftLat === "number" &&
    Number.isFinite(draftLat) &&
    typeof draftLng === "number" &&
    Number.isFinite(draftLng);

  const hasCoordinates =
    hasDraftCoordinates ||
    (typeof data?.lat === "number" && typeof data?.lng === "number");
  const mapLatitude = hasDraftCoordinates ? draftLat : data?.lat;
  const mapLongitude = hasDraftCoordinates ? draftLng : data?.lng;

  const handleUseMyLocation = () => {
    if (locationRequest.current || isSaving || isSubmitting) return;

    if (!navigator.geolocation) {
      toastService.error(
        t("map.geolocation_not_supported", "Geolocation is not supported by your browser."),
      );
      return;
    }

    const request = Symbol();
    locationRequest.current = request;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        if (locationRequest.current !== request) return;

        setValue("lat", latitude, { shouldDirty: true, shouldValidate: true });
        setValue("lng", longitude, { shouldDirty: true, shouldValidate: true });
        locationRequest.current = null;
        setLocating(false);
      },
      () => {
        if (locationRequest.current !== request) return;

        locationRequest.current = null;
        setLocating(false);
        toastService.error(
          t("map.unable_to_retrieve_location", "Unable to retrieve your location."),
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const onSubmit = async (formData: LabMetadataFormData) => {
    if (isSaving) {
      return;
    }

    const patchData: MediaPatchRequest = {
      item_type: itemType,
    };

    if (dirtyFields.lat) {
      patchData.lat = formData.lat;
    }
    if (dirtyFields.lng) {
      patchData.lng = formData.lng;
    }
    if (dirtyFields.altitude) {
      patchData.altitude = formData.altitude;
    }

    if (Object.keys(patchData).length === 1) {
      return;
    }

    try {
      const saved = await updateMediaMutation.mutateAsync({ mediaId: id, patchData });
      if (saved) reset({
        lat: saved.lat ?? undefined, lng: saved.lng ?? undefined, altitude: saved.altitude ?? undefined,
      });
    } catch {
      // The mutation displays the error; keep the user's draft for retry.
    }
  };

  // --- Normalization Logic for DetectionsDisplay ---
  // Use the 'in' operator to safely narrow the union type.
  const displayHfPath = data
    ? "hf_path" in data
      ? data.hf_path
      : data.frame_hf_path
    : undefined;

  // If it's a standard media response, use its detections array.
  // If it's a video detection response, wrap the object itself in an array.
  const displayDetections = data
    ? "detections" in data
      ? data.detections
      : [data]
    : [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-hyperion-cream">
      <PageAtmosphere variant="lab" />
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-12 sm:px-10">
        <header className="flex flex-col items-start gap-4">
          <Title text={t("lab.page.title")} size="4xl" />
          <p className="text-sm uppercase tracking-[0.4em] text-hyperion-slate-grey/70">
            {t("lab.page.subtitle")}
          </p>
        </header>

        <div className="mt-12 space-y-10 grid-cols-12 gap-6 sm:grid">
          <DetectionsDisplay
            key={id}
            mediaId={id}
            parentMediaId={"media_id" in data ? data.media_id : id}
            hasMediaDetections={"detections" in data ? data.has_trash || data.detections.length > 0 : true}
            hfPath={displayHfPath}
            detections={displayDetections}
            item_type={itemType}
          />
          <div className="col-span-12 rounded-lg bg-white/80 p-6 shadow-lg">
            {/* <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-hyperion-slate-grey/75">
              {t("lab.page.location", "Location")}
            </h2> */}

            <div className="">
              {hasCoordinates ? (
                <MiniMap
                  key={data?.id ?? "unknown"}
                  lat={mapLatitude as number}
                  lng={mapLongitude as number}
                  disabled={isSaving}
                  onPositionChange={(lat, lng) => {
                    if (lat !== draftLat) {
                      setValue("lat", lat, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                    if (lng !== draftLng) {
                      setValue("lng", lng, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1 rounded-2xl border border-hyperion-fog-grey bg-hyperion-cream/70 p-6 text-sm text-hyperion-slate-grey/80">
                    {t(
                      "lab.page.location_missing",
                      "No location metadata is available for this media yet.",
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locating || isSaving || isSubmitting}
                    aria-label={t("lab.page.use_my_location", "Use my location")}
                    aria-busy={locating}
                    title={locating
                      ? t("lab.page.locating", "Finding your location...")
                      : t("lab.page.use_my_location", "Use my location")}
                    className="shrink-0 rounded-full bg-hyperion-deep-sea p-3 text-hyperion-cream shadow-lg transition-all hover:bg-hyperion-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hyperion-deep-sea disabled:cursor-wait disabled:opacity-60"
                    id="use-my-location-btn"
                  >
                    {locating
                      ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                      : <MapPinned className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
              )}
            </div>

            <Divider
              label={t("lab.page.edit_location_manually")}
              bgColorClassName="bg-white"
              className="my-6"
            ></Divider>

            <LocationForm
              id={id}
              register={register}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              errors={errors}
              isDirty={isDirty}
              isSubmitting={isSubmitting}
              isUpdatePending={isSaving || updateMediaMutation.isPending}
              onReset={() => {
                locationRequest.current = null;
                setLocating(false);
                // Clear optional inputs before reset discards their registered refs.
                setValue("lat", data.lat);
                setValue("lng", data.lng);
                setValue("altitude", data.altitude);
                reset({
                  lat: data?.lat,
                  lng: data?.lng,
                  altitude: data?.altitude,
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabPage;
