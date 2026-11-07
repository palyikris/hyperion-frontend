import type { UXResponse } from "../../../types/dashboard/dashboard";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { RollingNumber } from "../../shared/animation/RollingNumber";
import { Blob, blobShapes } from "../../shared/decoration";

type UserExperiencePulseProps = {
  data: UXResponse;
};

const UserExperiencePulse = ({ data }: UserExperiencePulseProps) => {
  const { t } = useTranslation();
  const activeNow = data.active_now ?? 0;
  const avgResponseTime = Number.isFinite(data.avg_response_time)
    ? Math.round(data.avg_response_time)
    : 0;
  const responseTimeClass = avgResponseTime
    ? avgResponseTime <= 200
      ? "text-hyperion-forest"
      : avgResponseTime <= 500
        ? "text-hyperion-burnt-orange"
        : "text-red-600"
    : "text-hyperion-slate-grey/70";

  return (
    <div className="grid gap-6 lg:h-full lg:grid-rows-2">
      <ScrollReveal
        className="relative flex h-full flex-col items-center justify-center overflow-hidden border border-hyperion-forest/35 bg-white/85 p-8 text-center shadow-[rgba(26,95,84,0.18)_0px_18px_50px]"
        style={{ borderRadius: "36px 62px 40px 70px / 50px 34px 64px 42px" }}
      >
        <Blob
          color="bg-hyperion-soft-sky/70"
          size="h-20 w-24"
          position="-top-12 left-6"
          shape={blobShapes.organic26}
        />
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          {t("dashboard.userExperience.activeNow")}
        </p>
        <p className="mt-4 text-6xl font-black text-hyperion-forest">
          {activeNow.toLocaleString()}
        </p>
      </ScrollReveal>

      <ScrollReveal
        className="relative flex h-full flex-col items-center justify-center overflow-hidden border border-hyperion-burnt-orange/40 bg-white/85 p-8 text-center shadow-[rgba(26,95,84,0.18)_0px_18px_50px]"
        style={{ borderRadius: "38px 70px 34px 62px / 46px 66px 34px 58px" }}
      >
        <Blob
          color="bg-hyperion-burnt-orange/35"
          size="h-24 w-28"
          position="-bottom-16 right-4"
          shape={blobShapes.organic28}
        />
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-hyperion-slate-grey/70">
          {t("dashboard.userExperience.avgResponseTime")}
        </p>
        {avgResponseTime ? (
          <RollingNumber
            value={avgResponseTime}
            postfix={t("dashboard.userExperience.ms")}
            className={`mt-4 text-6xl font-black ${responseTimeClass}`}
          ></RollingNumber>
        ) : (
          "-"
        )}
      </ScrollReveal>
    </div>
  );
};

export default UserExperiencePulse;
