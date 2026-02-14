import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fingerprint, Key, LogIn } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InputField } from "../../shared/InputField";
import { Button } from "../../shared/Button";
import { Link } from "react-router-dom";
import { createLoginSchema } from "../../../schemas/auth/auth";
import { useAuth } from "../../../hooks/auth/useAuth";
import type { UserData } from "../../../types/auth/auth";

export const LoginForm = () => {
  const { t, i18n } = useTranslation();
  const loginSchema = useMemo(
    () => createLoginSchema(t),
    [t, i18n.resolvedLanguage],
  );
  const { login, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<UserData, "full_name">>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: Omit<UserData, "full_name">) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <InputField
        label={t("login.form.emailLabel")}
        id="email"
        type="email"
        placeholder={t("login.form.emailPlaceholder")}
        icon={Fingerprint}
        inputProps={register("email")}
        error={errors.email?.message}
      />

      <InputField
        label={t("login.form.passwordLabel")}
        id="password"
        type="password"
        placeholder={t("login.form.passwordPlaceholder")}
        icon={Key}
        inputProps={register("password")}
        error={errors.password?.message}
        rightAction={
          errors ? null : (
            <a
              className="text-[10px] font-bold text-hyperion-slate-grey/50 hover:text-hyperion-deep-sea transition-colors uppercase tracking-tight"
              href="#"
            >
              {t("login.form.recovery")}
            </a>
          )
        }
      />

      <Button
        type="submit"
        disabled={isLoading}
        text={isLoading ? t("login.form.loggingIn") : t("login.form.submit")}
        icon={<LogIn className="w-5 h-5 text-white" />}
      ></Button>

      <div className="w-full flex justify-center gap-2 items-center">
        <span className="text-[10px] text-hyperion-slate-grey/50">
          {t("login.form.noAccount")}{" "}
        </span>
        <Link
          className="text-[12px] font-bold text-hyperion-slate-grey/50 hover:text-hyperion-deep-sea transition-colors uppercase tracking-tight"
          to="/signup"
        >
          {t("login.form.signup")}
        </Link>
      </div>
    </form>
  );
};
