import { SettingsForm } from "../components/features/settings/SettingsForm";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../components/shared/animation/ScrollReveal";
import { DecryptText } from "../components/shared/animation/DecryptText";
import { useMeAuth } from "../hooks/auth/useMeAuth";
import { PageAtmosphere } from "../components/shared/decoration";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { data: user } = useMeAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-hyperion-cream flex items-center justify-center p-6">
      <PageAtmosphere variant="settings" />

      <ScrollReveal className="relative w-full max-w-7xl bg-white/90 backdrop-blur-sm rounded-[40px] shadow-[rgba(26,95,84,0.16)_0px_24px_90px] overflow-hidden border border-hyperion-muted-gold/60">
        <div className="p-12 flex flex-col md:flex-row gap-16">
          <div className="flex flex-col items-center text-center space-y-6 md:w-1/3">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-hyperion-soft-sky flex items-center justify-center border-4 border-white shadow-inner">
                <div className="w-16 h-24 bg-hyperion-muted-gold/20 rounded-xl"></div>
              </div>
              <div className="absolute bottom-2 right-2 bg-hyperion-deep-sea text-white p-2 rounded-full border-4 border-white">
                <img src="/avatar.png" alt="Hyperion avatar image" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-hyperion-deep-sea">
                {t("settings.page.currentOperator")}
              </h2>
              <p className="text-hyperion-slate-grey font-mono text-sm">
                {user?.email?.toString() || ""}
              </p>
            </div>

            <DecryptText
              className="px-4 py-1 bg-hyperion-soft-sky text-hyperion-deep-sea text-[10px] font-bold tracking-widest uppercase rounded-full"
              text={t("settings.page.authorizationVerified")}
            ></DecryptText>
          </div>
          <SettingsForm />
        </div>
      </ScrollReveal>
    </div>
  );
};

export default SettingsPage;