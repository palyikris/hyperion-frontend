import { z } from "zod";
export const createSettingsSchema = (t: (key: string) => string) =>
  z.object({
    full_name: z
      .string()
      .min(1, t("settings.validation.fullNameRequired")),
    language: z
      .string()
      .min(1, t("settings.validation.languageRequired")),
  });

export type SettingsFormData = z.infer<
  ReturnType<typeof createSettingsSchema>
>;
