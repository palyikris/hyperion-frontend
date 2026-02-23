import { useTranslation } from "react-i18next";
import { Title } from "../../shared/Title";

const VaultHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 flex w-full flex-col items-start">
      <Title text={t("nav.main.vault")} size="4xl" />
      <p className="text-sm uppercase tracking-[0.4em] text-hyperion-slate-grey/70">
        {t("vault.page.subtitle", "Archive & Intel Management")}
      </p>
    </div>
  );
};

export default VaultHeader;
