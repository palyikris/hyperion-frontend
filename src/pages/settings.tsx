import { SettingsForm } from "../components/features/settings/SettingsForm";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen relative overflow-hidden bg-hyperion-cream flex items-center justify-center p-6 pl-26">
      <div
        className="pointer-events-none absolute -top-20 left-8 h-[22rem] w-[22rem] bg-hyperion-forest/8"
        style={{ borderRadius: "34% 66% 58% 42% / 44% 34% 66% 56%" }}
      />
      <div
        className="pointer-events-none absolute top-20 -right-16 h-[24rem] w-[24rem] bg-hyperion-soft-sky/40"
        style={{ borderRadius: "68% 32% 52% 48% / 42% 58% 44% 56%" }}
      />
      <div
        className="pointer-events-none absolute bottom-12 left-1/2 h-36 w-[26rem] -translate-x-1/2 bg-hyperion-sage-mint/18"
        style={{ borderRadius: "78% 22% 70% 30% / 54% 46% 54% 46%" }}
      />
      <div className="pointer-events-none absolute right-12 top-16 h-2 w-16 rounded-full bg-hyperion-muted-gold/40" />

      <div className="relative w-full max-max-w-3xl bg-white/90 backdrop-blur-sm rounded-[40px] shadow-[rgba(26,95,84,0.16)_0px_24px_90px] overflow-hidden border border-hyperion-fog-grey">
        <div className="p-12 flex flex-col md:flex-row gap-16">
          <div className="flex flex-col items-center text-center space-y-6 md:w-1/3">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-hyperion-soft-sky flex items-center justify-center border-4 border-white shadow-inner">
                <div className="w-16 h-24 bg-hyperion-muted-gold/20 rounded-xl"></div>
              </div>
              <div className="absolute bottom-2 right-2 bg-hyperion-deep-sea text-white p-2 rounded-full border-4 border-white">
                <img src="/public/avatar.png" alt="" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-hyperion-deep-sea">
                {t("settings.page.currentOperator")}
              </h2>
              <p className="text-hyperion-slate-grey font-mono text-sm">
                {user.email || ""}
              </p>
            </div>

            <span className="px-4 py-1 bg-hyperion-soft-sky text-hyperion-deep-sea text-[10px] font-bold tracking-widest uppercase rounded-full">
              {t("settings.page.authorizationVerified")}
            </span>
          </div>
          <SettingsForm />
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;