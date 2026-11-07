import { z } from "zod";
export const createSettingsSchema = (t: (key: string) => string) =>
  z.object({
    full_name: z
      .string()
      .trim()
      .min(1, t("settings.validation.fullNameRequired")),
    language: z.enum(["en", "hu"], {
      error: (issue) => t(
        issue.input === "" || issue.input === undefined || issue.input === null
          ? "settings.validation.languageRequired"
          : "settings.validation.languageUnsupported",
      ),
    }),
  });

export type SettingsFormData = z.infer<
  ReturnType<typeof createSettingsSchema>
>;
