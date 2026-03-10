import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Languages, User, Download } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "../../shared/Button";
import { InputField } from "../../shared/InputField";
import { SelectField } from "../../shared/SelectField";
import {
  createSettingsSchema,
  type SettingsFormData,
} from "../../../schemas/settings/settings";
import { useMeAuth } from "../../../hooks/auth/useMeAuth";
import { useUpdateMe } from "../../../hooks/auth/useUpdateMe";

export const SettingsForm = () => {
  const { t, i18n } = useTranslation();

  const settingsSchema = useMemo(
    () => createSettingsSchema(t),
    [t, i18n.resolvedLanguage],
  );

  const { data: user } = useMeAuth();

  const update = useUpdateMe();
  const isSubmitting = update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      language: "en",
    },
  });

  useEffect(() => {
    reset({
      full_name: user?.full_name?.toString() ?? "",
      language: user?.language?.toString() ?? "en",
    });
  }, [reset, user?.full_name, user?.language]);

  const onSubmit = (data: SettingsFormData) => {
    update.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-1 space-y-8"
      aria-busy={isSubmitting}
    >
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
          text={
            isSubmitting
              ? `${t("settings.form.submit")}...`
              : t("settings.form.submit")
          }
          icon={<Download size={15} />}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default SettingsForm;
