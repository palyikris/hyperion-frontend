import { z } from "zod";
export const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .email(t("auth.validation.invalidEmail"))
      .min(1, t("auth.validation.emailRequired")),
    password: z.string().min(8, t("auth.validation.passwordMinLength")),
  });

export const createSignupSchema = (t: (key: string) => string) =>
  createLoginSchema(t).extend({
    full_name: z.string().min(1, t("auth.validation.fullNameRequired")),
  });
