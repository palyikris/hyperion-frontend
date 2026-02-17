import { useTranslation } from "react-i18next";
import Gallery from "../components/features/upload/Gallery";
import UploadDropZone from "../components/features/upload/UploadDropZone";
import Divider from "../components/shared/Divider";
import { Title } from "../components/shared/Title";
import LoadingScreen from "../components/shared/LoadingScreen";
import { useRecentGallery } from "../hooks/upload/useRecentGallery";
import { useUploadFiles } from "../hooks/upload/useUploadFiles";


const UploadPage = () => {
  const { t } = useTranslation();
  const recentGalleryQuery = useRecentGallery();
  const uploadFilesMutation = useUploadFiles();

  const handleUpload = (files: File[]) => {
    if (!files.length) {
      return;
    }

    uploadFilesMutation.mutate(files);
  };

  const handleCardZoom = (itemId: string) => {
    console.log("Zooming to card:", itemId);
    // Handle zoom/open modal logic here
  };

  if (recentGalleryQuery.isLoading) {
    return <LoadingScreen />;
  }

  const galleryItems = recentGalleryQuery.data ?? [];

  return (
    <div className="relative min-h-screen bg-hyperion-cream">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-32 left-10 h-80 w-96 bg-hyperion-soft-sky/80"
          style={{ borderRadius: "72% 28% 51% 49% / 42% 58% 42% 58%" }}
        />
        <div
          className="absolute bottom-20 right-12 h-64 w-80 bg-hyperion-cool-aqua/70"
          style={{ borderRadius: "42% 58% 71% 29% / 58% 44% 56% 42%" }}
        />
        <div
          className="absolute top-40 right-32 h-32 w-56 bg-hyperion-burnt-orange/35"
          style={{ borderRadius: "38% 62% 58% 42% / 71% 39% 61% 29%" }}
        />
        <div
          className="absolute bottom-32 left-32 h-20 w-44 bg-hyperion-sage-mint/55"
          style={{ borderRadius: "64% 36% 42% 58% / 58% 71% 29% 42%" }}
        />
        <div
          className="absolute top-16 right-20 h-24 w-40 bg-hyperion-forest/35"
          style={{ borderRadius: "71% 29% 64% 36% / 39% 58% 42% 61%" }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-12 sm:px-10 space-y-12">
        <header className="flex flex-col items-start gap-4">
          <Title text={t("upload.page.title")} size="4xl" />
          <p className="text-sm uppercase tracking-[0.4em] text-hyperion-slate-grey/70">
            {t("upload.page.subtitle")}
          </p>
        </header>

        <UploadDropZone onFilesSelected={handleUpload} />

        <Divider
          label={t("upload.divider.label")}
          leftDotClassName="bg-hyperion-burnt-orange"
          rightDotClassName="bg-hyperion-cool-aqua"
          textClassName="text-hyperion-forest/70"
        />

        <Gallery items={galleryItems} onCardZoom={handleCardZoom} />
      </div>
    </div>
  );
};

export default UploadPage;