import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/auth/useAuth";
import { createSignupSchema } from "../../../schemas/auth/auth";
import type { UserData } from "../../../types/auth/auth";
import { InputField } from "../../shared/InputField";
import { Button } from "../../shared/Button";
import { Link } from "react-router-dom";

const SignupForm = () => {
  const { t, i18n } = useTranslation();
  const signupSchema = useMemo(
    () => createSignupSchema(t),
    [t, i18n.resolvedLanguage],
  );
  const { signup, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur", // validates when a user leaves the input field
  });

  const onSubmit = (data: UserData) => {
    signup(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label={t("signup.form.fullNameLabel")}
        icon={User}
        type="text"
        id="signup-full-name"
        placeholder={t("signup.form.fullNamePlaceholder")}
        inputProps={register("full_name")}
        error={errors.full_name?.message}
      />

      <InputField
        label={t("signup.form.emailLabel")}
        icon={Mail}
        type="email"
        id="signup-email"
        placeholder={t("signup.form.emailPlaceholder")}
        inputProps={register("email")}
        error={errors.email?.message}
      />

      <InputField
        label={t("signup.form.passwordLabel")}
        icon={Lock}
        type="password"
        id="signup-password"
        placeholder={t("signup.form.passwordPlaceholder")}
        inputProps={register("password")}
        error={errors.password?.message}
      />

      <Button
        type="submit"
        disabled={isLoading}
        text={
          isLoading ? t("signup.form.creatingAccount") : t("signup.form.submit")
        }
      />

      <div className="w-full flex flex-wrap justify-center gap-x-2 gap-y-1 items-center text-center">
        <span className="text-[10px] sm:text-xs text-hyperion-slate-grey/50">
          {t("signup.form.haveAccount")}{" "}
        </span>
        <Link
          className="text-[11px] sm:text-xs font-bold text-hyperion-slate-grey/50 hover:text-hyperion-deep-sea transition-colors uppercase tracking-tight"
          to="/login"
        >
          {t("signup.form.login")}
        </Link>
      </div>
    </form>
  );
};

export default SignupForm;
