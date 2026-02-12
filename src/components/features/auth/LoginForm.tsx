import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fingerprint, Key, LogIn } from "lucide-react";
import { InputField } from "../../shared/InputField";
import { Button } from "../../shared/Button";
import { Link } from "react-router-dom";
import { loginSchema } from "../../../schemas/auth/auth";
import { useAuth } from "../../../hooks/auth/useAuth";
import type { UserData } from "../../../types/auth/auth";

export const LoginForm = () => {
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
        label="Email address"
        id="email"
        type="email"
        placeholder="agent@hyperion.eco"
        icon={Fingerprint}
        inputProps={register("email")}
        error={errors.email?.message}
      />

      <InputField
        label="Password"
        id="password"
        type="password"
        placeholder="••••••••"
        icon={Key}
        inputProps={register("password")}
        error={errors.password?.message}
        rightAction={
          <a
            className="text-[10px] font-bold text-hyperion-slate-grey/50 hover:text-hyperion-deep-sea transition-colors uppercase tracking-tight"
            href="#"
          >
            Recovery?
          </a>
        }
      />

      <Button
        type="submit"
        disabled={isLoading}
        text={isLoading ? "Logging in..." : "Log In"}
        icon={<LogIn className="w-5 h-5 text-white" />}
      ></Button>

      <div className="w-full flex justify-center gap-2 items-center">
        <span className="text-[10px] text-hyperion-slate-grey/50">
          Don't have an account?{" "}
        </span>
        <Link
          className="text-[12px] font-bold text-hyperion-slate-grey/50 hover:text-hyperion-deep-sea transition-colors uppercase tracking-tight"
          to="/signup"
        >
          Sign Up
        </Link>
      </div>
    </form>
  );
};
