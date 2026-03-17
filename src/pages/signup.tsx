import { useTranslation } from "react-i18next";
import { useState } from "react";
import { SignupForm } from "../components/features/auth/SignupForm";
import { Title } from "../components/shared/Title";
import { ScrollReveal } from "../components/shared/animation/ScrollReveal";

export const SignupPage = () => {
  const { t } = useTranslation();
  const [isImgLoading, setIsImgLoading] = useState(true);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative bg-hyperion-cream overflow-hidden">
      {/* Left Column: Stylized Scene */}
      <div className="hidden lg:flex lg:w-4/7 xl:w-4/6 relative overflow-hidden bg-linear-to-b from-hyperion-deep-sea to-hyperion-deep-sea">
        {/* Loader overlay */}
        {isImgLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-hyperion-deep-sea/80 transition-opacity duration-700">
            <div className="relative flex flex-col items-center">
              <div
                className="w-24 h-24 border-2 border-dashed border-hyperion-sage-mint/40 rounded-full animate-spin mb-6"
                style={{ animationDuration: "2.5s" }}
              />
              <div
                className="w-32 h-32 bg-hyperion-forest/20 animate-pulse-blob"
                style={{ borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%" }}
              />
            </div>
            <span className="mt-6 text-hyperion-sage-mint font-bold text-xs tracking-[0.5em]">
              {t("loading.status.lookingForTrash", "LOADING...")}
            </span>
          </div>
        )}
        <img
          src="/forest.png"
          alt={t("signup.page.authImageAlt")}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto h-full object-cover z-10 transition-opacity duration-700 ${isImgLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsImgLoading(false)}
          style={{
            filter: isImgLoading ? "blur(12px)" : "none",
            transition: "opacity 0.7s, filter 0.7s",
          }}
        />
        <div
          className="w-3/4 h-2/3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-hyperion-forest/40"
          style={{
            borderRadius: "30% 70% 70% 30% / 48% 30% 70% 52% ",
          }}
        ></div>
        {/* Curvy Divider */}
        <div className="absolute top-[-10%] -right-10 h-[120%] w-90 z-20">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 1000"
          >
            <path
              className="fill-hyperion-cream"
              d="M100 0 C 55 80, 80 190, 55 290 S 30 500, 60 600 S 100 780, 55 880 S 30 950, 100 1000 L 100 0 Z"
            ></path>
          </svg>
        </div>
        {/* Loader blob animation keyframes */}
        <style>{`
          @keyframes pulse-blob {
            0%, 100% { transform: scale(1); border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
            50% { transform: scale(1.03); border-radius: 50% 50% 60% 40% / 50% 50% 50% 50%; }
          }
          .animate-pulse-blob { animation: pulse-blob 6s ease-in-out infinite; }
        `}</style>
      </div>

      {/* Right Column: Login Card */}
      <div className="flex-1 flex flex-col justify-center items-center relative px-4 py-8 sm:px-6 md:px-8">
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <img
            src="/forest.png"
            alt={t("signup.page.authImageAlt")}
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-linear-to-b from-hyperion-deep-sea/35 via-hyperion-forest/10 to-hyperion-cream/90" />
        </div>
        <div className="w-full max-w-md md:max-w-lg z-10 lg:pr-4 flex justify-center items-center flex-col">
          <div className="w-full flex justify-center items-center flex-col text-center">
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-10 left-1/2 h-20 w-56 -translate-x-1/2 rounded-full bg-hyperion-forest/25 blur-3xl" />
              <Title
                text={t("signup.page.brand")}
                colorFrom="hyperion-forest"
                colorVia="hyperion-deep-sea"
                colorTo="hyperion-cool-aqua"
                size="5xl"
                className="mb-4 text-2xl sm:text-4xl md:text-5xl tracking-[0.14em] sm:tracking-[0.24em]"
              ></Title>
            </div>
          </div>
          <ScrollReveal
            className="w-full p-6 sm:p-8 md:p-10 lg:p-12 border border-hyperion-muted-gold/60 bg-white/50 backdrop-blur-sm relative"
            style={{
              borderRadius: "31% 69% 47% 53% / 61% 30% 70% 39% ",
              boxShadow: "rgba(26,95,84, 0.3) 0px 1px 4px",
            }}
          >
            <div
              className="absolute -z-1 top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-hyperion-deep-sea/5"
              style={{
                borderRadius: "73% 27% 70% 30% / 36% 69% 31% 64% ",
              }}
            ></div>
            <SignupForm></SignupForm>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
