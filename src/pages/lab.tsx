import { useTranslation } from "react-i18next";
import { Title } from "../components/shared/Title";
import { useParams } from "react-router-dom";
import { useGetMedia } from "../hooks/lab/useGetMedia";
import { useGetVideoMedia } from "./../hooks/lab/useGetVideoMedia";
import LoadingScreen from "../components/shared/LoadingScreen";
import MiniMap from "../components/features/lab/MiniMap";
import LocationForm from "../components/features/lab/LocationForm";
import { useEffect, useMemo } from "react";
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

type CombinedMediaData = MediaResponse | VideoDetectionResponse;

const useGetCombinedMedia = (id?: string) => {
  const mediaQuery = useGetMedia(id);

  const noMediaFound =
    (mediaQuery.isSuccess && !mediaQuery.data) || mediaQuery.isError;

  const videoQuery = useGetVideoMedia(id, {
    enabled: !!id && noMediaFound,
  });

  const isPending =
    mediaQuery.isPending || (noMediaFound && videoQuery.isPending);
  const data =
    mediaQuery.data || (videoQuery.data as CombinedMediaData | undefined);

  return { data, isPending };
};

const LabPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data, isPending } = useGetCombinedMedia(id);

  const updateMediaMutation = useUpdateMedia();
  const metadataSchema = useMemo(() => createLabMetadataSchema(t), [t]);

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
    if (!data) {
      return;
    }

    reset({
      lat: data.lat,
      lng: data.lng,
      altitude: data.altitude,
    });
  }, [data, reset]);

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

  const onSubmit = async (formData: LabMetadataFormData) => {
    if (!id) {
      return;
    }

    const patchData: MediaPatchRequest = {};

    if (dirtyFields.lat) {
      patchData.lat = formData.lat;
    }
    if (dirtyFields.lng) {
      patchData.lng = formData.lng;
    }
    if (dirtyFields.altitude) {
      patchData.altitude = formData.altitude;
    }

    if (Object.keys(patchData).length === 0) {
      return;
    }

    await updateMediaMutation.mutateAsync({
      mediaId: id,
      patchData,
    });
  };

  if (isPending) {
    return <LoadingScreen />;
  }

  // --- Normalization Logic for DetectionsDisplay ---
  // We use the 'in' operator to safely narrow the union type.
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
            mediaId={id}
            hfPath={displayHfPath}
            detections={displayDetections}
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
                <div className="rounded-2xl border border-hyperion-fog-grey bg-hyperion-cream/70 p-6 text-sm text-hyperion-slate-grey/80">
                  {t(
                    "lab.page.location_missing",
                    "No location metadata is available for this media yet.",
                  )}
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
              isUpdatePending={updateMediaMutation.isPending}
              onReset={() =>
                reset({
                  lat: data?.lat,
                  lng: data?.lng,
                  altitude: data?.altitude,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabPage;
