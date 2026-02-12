import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User } from "lucide-react";
import { useAuth } from "../../../hooks/auth/useAuth";
import { signupSchema } from "../../../schemas/auth/auth";
import type { UserData } from "../../../types/auth/auth";
import { InputField } from "../../shared/InputField";
import { Button } from "../../shared/Button";
import { Link } from "react-router-dom";

const SignupForm = () => {
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
        label="Full name"
        icon={User}
        type="text"
        id="signup-full-name"
        placeholder="Full name"
        inputProps={register("full_name")}
        error={errors.full_name?.message}
      />

      <InputField
        label="Email"
        icon={Mail}
        type="email"
        id="signup-email"
        placeholder="you@example.com"
        inputProps={register("email")}
        error={errors.email?.message}
      />

      <InputField
        label="Password"
        icon={Lock}
        type="password"
        id="signup-password"
        placeholder="Create a strong password"
        inputProps={register("password")}
        error={errors.password?.message}
      />

      <Button
        type="submit"
        disabled={isLoading}
        text={isLoading ? "Creating Account..." : "Sign Up"}
      />

      <div className="w-full flex justify-center gap-2 items-center">
        <span className="text-[10px] text-hyperion-slate-grey/50">
          Already have an account?{" "}
        </span>
        <Link
          className="text-[12px] font-bold text-hyperion-slate-grey/50 hover:text-hyperion-deep-sea transition-colors uppercase tracking-tight"
          to="/login"
        >
          Log In
        </Link>
      </div>
    </form>
  );
};

export default SignupForm;
