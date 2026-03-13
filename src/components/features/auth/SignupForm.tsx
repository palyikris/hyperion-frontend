import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, LogIn } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InputField } from "../../shared/InputField";
import { Button } from "../../shared/Button";
import { Link } from "react-router-dom";
import { createSignupSchema } from "../../../schemas/auth/auth";
import { useAuth } from "../../../hooks/auth/useAuth";


type SignupFormValues = {
  full_name: string;
  email: string;
  password: string;
};

export const SignupForm = () => {
  const { t, i18n } = useTranslation();
  const signupSchema = useMemo(() => createSignupSchema(t), [t, i18n.resolvedLanguage]);
  const { signup, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: SignupFormValues) => {
    signup(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <InputField
        label={t("signup.form.fullNameLabel")}
        id="signup-full-name"
        type="text"
        placeholder={t("signup.form.fullNamePlaceholder")}
        icon={User}
        inputProps={register("full_name")}
        error={errors.full_name?.message}
      />

      <InputField
        label={t("signup.form.emailLabel")}
        id="signup-email"
        type="email"
        placeholder={t("signup.form.emailPlaceholder")}
        icon={Mail}
        inputProps={register("email")}
        error={errors.email?.message}
      />

      <InputField
        label={t("signup.form.passwordLabel")}
        id="signup-password"
        type="password"
        placeholder={t("signup.form.passwordPlaceholder")}
        icon={Lock}
        inputProps={register("password")}
        error={errors.password?.message}
      />

      <Button
        type="submit"
        disabled={isLoading}
        text={isLoading ? t("signup.form.creatingAccount") : t("signup.form.submit")}
        icon={<LogIn className="w-5 h-5 text-white" />}
      />

      <div className="w-full flex flex-wrap justify-center gap-x-2 gap-y-1 items-center text-center">
        <span className="text-[10px] sm:text-xs text-hyperion-slate-grey/50">
          {t("signup.form.haveAccount")} {" "}
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
