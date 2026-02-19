import { useTranslation } from "react-i18next";
import { LoginForm } from "../components/features/auth/LoginForm";
import { Title } from "../components/shared/Title";
import { ScrollReveal } from "../components/shared/animation/ScrollReveal";

export const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative bg-hyperion-cream overflow-hidden">
      {/* Left Column: Stylized Scene */}
      <div className="hidden md:flex md:w-4/7 xl:w-3/5 relative overflow-hidden bg-gradient-to-b from-hyperion-deep-sea to-hyperion-deep-sea">
        <img
          src="/forest.png"
          alt={t("login.page.authImageAlt")}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto h-full object-cover z-10 "
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
      </div>

      {/* Right Column: Login Card */}
      <div className="flex-1 flex flex-col justify-center items-center relative px-4 py-8 sm:px-6 md:px-8">
        <div className="w-full max-w-md md:max-w-lg z-10 md:pr-4 flex justify-center items-center flex-col">
          <div className="w-full flex justify-center items-center flex-col text-center">
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-10 left-1/2 h-20 w-56 -translate-x-1/2 rounded-full bg-hyperion-forest/60 blur-3xl" />
              <Title
                text={t("login.page.brand")}
                colorFrom="hyperion-forest"
                colorVia="hyperion-deep-sea"
                colorTo="hyperion-cool-aqua"
                size="5xl"
                className="text-3xl sm:text-4xl md:text-5xl tracking-[0.2em] sm:tracking-[0.28em]"
              ></Title>
            </div>
            <img
              src="/logo.png"
              alt={t("login.page.logoAlt")}
              width={50}
              className="my-4 sm:my-5"
            />
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
            <LoginForm />
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
