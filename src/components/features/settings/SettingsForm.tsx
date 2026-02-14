import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Languages, User, Download } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "../../shared/Button";
import { InputField } from "../../shared/InputField";
import { SelectField } from "../../shared/SelectField";
import {
  createSettingsSchema,
  type SettingsFormData,
} from "../../../schemas/settings/settings";
import { useUpdateMe } from "../../../hooks/auth/useUpdateMe";

export const SettingsForm = () => {
  const { t, i18n } = useTranslation();

  const settingsSchema = useMemo(
    () => createSettingsSchema(t),
    [t, i18n.resolvedLanguage],
  );

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const update = useUpdateMe();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    mode: "onBlur",
    defaultValues: {
      full_name: user.full_name || "",
      language: user.language || "en",
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    update.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-8">
      <InputField
        label={t("settings.form.fullNameLabel")}
        icon={User}
        type="text"
        id="full-name"
        placeholder={t("settings.form.fullNamePlaceholder")}
        inputProps={register("full_name")}
        error={errors.full_name?.message}
      />

      <SelectField
        label={t("settings.form.languageLabel")}
        icon={Languages}
        id="app-language"
        rightIcon={<ChevronDown className="w-5 h-5" />}
        options={[
          { label: t("settings.form.languageOptionEnglish"), value: "en" },
          { label: t("settings.form.languageOptionHungarian"), value: "hu" },
        ]}
        selectProps={register("language")}
        error={errors.language?.message}
      />

      <div className="pt-4 space-y-4">
        <Button
          type="submit"
          text={t("settings.form.submit")}
          icon={<Download size={15} />}
        />
      </div>
    </form>
  );
};

export default SettingsForm;
