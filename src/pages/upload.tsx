import { useTranslation } from "react-i18next";
import Gallery from "../components/features/upload/Gallery";
import ImageModal from "../components/shared/ImageModal";
import UploadDropZone from "../components/features/upload/UploadDropZone";
import Divider from "../components/shared/Divider";
import { Title } from "../components/shared/Title";
import LoadingScreen from "../components/shared/LoadingScreen";
import { useRecentGallery } from "../hooks/upload/useRecentGallery";
import { useState } from "react";
import { PageAtmosphere } from "../components/shared/decoration";

const UploadPage = () => {
  const { t } = useTranslation();
  const recentGalleryQuery = useRecentGallery();

  const [zoomedImage, setZoomedImage] = useState<{
    id: string;
    url: string;
  } | null>(null);

  const handleCardZoom = (itemId: string, imageUrl: string) => {
    setZoomedImage({ id: itemId, url: imageUrl });
  };

  const handleCloseModal = () => setZoomedImage(null);

  if (recentGalleryQuery.isLoading) {
    return <LoadingScreen />;
  }

  const galleryItems = recentGalleryQuery.data;
  const items = galleryItems?.items || [];


  return (
    <div className="relative min-h-screen bg-hyperion-cream">
      <PageAtmosphere variant="upload" />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-12 sm:px-10 space-y-12">
        <header className="flex flex-col items-start gap-4">
          <Title text={t("upload.page.title")} size="4xl" />
          <p className="text-sm uppercase tracking-[0.4em] text-hyperion-slate-grey/70">
            {t("upload.page.subtitle")}
          </p>
        </header>

        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1">
            <UploadDropZone />
          </div>
          <div className="flex-1">
            <UploadDropZone
              multiple={false}
              accept="video/mp4,video/webm,video/ogg"
              label={t("upload.dropzone.videoHeading", "Upload a video")}
              description={t(
                "upload.dropzone.videoDescription",
                "Drag and drop a video file or click to browse.",
              )}
              browseText={t("upload.dropzone.browseVideo", "Browse video")}
              fileSupportText={t(
                "upload.dropzone.videoSupport",
                "Supported: mp4, webm, ogg",
              )}
            />
          </div>
        </div>

        <Divider
          label={t("upload.divider.label")}
          leftDotClassName="bg-hyperion-burnt-orange"
          rightDotClassName="bg-hyperion-cool-aqua"
          textClassName="text-hyperion-forest/70"
        />

        <Gallery items={items} onCardZoom={handleCardZoom} showInfo={false} />
      </div>

      <ImageModal
        open={!!zoomedImage}
        imageUrl={zoomedImage?.url || ""}
        alt={zoomedImage?.id}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default UploadPage;