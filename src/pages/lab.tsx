import { useTranslation } from "react-i18next";
import { Title } from "../components/shared/Title";
import { useParams } from "react-router-dom";
import { useGetMedia } from "../hooks/media/useGetMedia";
import LoadingScreen from "../components/shared/LoadingScreen";
// import { useState } from 'react';

const LabPage = () => {

  const { t } = useTranslation();
  const { id } = useParams();
  console.log("Lab ID:", id);

  const { data, isPending } = useGetMedia(id);

  // const [originalData, setOriginalData] = useState(data);
  // const [draftData, setDraftData] = useState(data);
  
  if (isPending) {
    return <LoadingScreen />;
  }

  console.log("Media Data:", data);


  return (
    <div className="relative min-h-screen overflow-hidden bg-hyperion-cream">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-32 right-12 h-72 w-72 bg-hyperion-soft-sky/80"
          style={{ borderRadius: "72% 28% 45% 55% / 35% 52% 48% 65%" }}
        />
        <div
          className="absolute bottom-24 left-16 h-72 w-72 bg-hyperion-cool-aqua/70"
          style={{ borderRadius: "42% 58% 54% 46% / 65% 35% 65% 35%" }}
        />
        <div
          className="absolute right-40 bottom-32 h-24 w-48 bg-hyperion-burnt-orange/35"
          style={{ borderRadius: "38% 62% 58% 42% / 48% 52% 48% 52%" }}
        />
        <div
          className="absolute left-32 top-40 h-16 w-40 bg-hyperion-sage-mint/55"
          style={{ borderRadius: "55% 45% 38% 62% / 62% 42% 58% 38%" }}
        />
        <div
          className="absolute bottom-32 right-20 h-16 w-32 bg-hyperion-forest/35"
          style={{ borderRadius: "65% 35% 52% 48% / 38% 62% 38% 62%" }}
        />
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-12 sm:px-10">
        <header className="flex flex-col items-start gap-4">
          <Title text={t("lab.page.title")} size="4xl" />
          <p className="text-sm uppercase tracking-[0.4em] text-hyperion-slate-grey/70">
            {t("lab.page.subtitle")}
          </p>
        </header>

        <div className="mt-12 space-y-10">
        </div>
      </div>
    </div>
  );
}

export default LabPage;