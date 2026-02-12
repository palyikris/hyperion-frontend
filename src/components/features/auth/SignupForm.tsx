import { Fingerprint, Key, UserPlus, User } from "lucide-react";
import { InputField } from "../../shared/InputField";
import { Button } from "../../shared/Button";
import { Link } from "react-router-dom";

export const SignupForm = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void =>
    e.preventDefault();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField
        label="Full Name"
        id="name"
        type="text"
        placeholder="John Doe"
        icon={User}
      />

      <InputField
        label="Email address"
        id="email"
        type="email"
        placeholder="agent@hyperion.eco"
        icon={Fingerprint}
      />

      <InputField
        label="Password"
        id="password"
        type="password"
        placeholder="••••••••"
        icon={Key}
      />

      <Button
        text="Sign Up"
        icon={<UserPlus className="w-5 h-5 text-white" />}
      ></Button>

      <div className="w-full flex justify-center gap-2 items-center">
        <span className="text-[10px] text-hyperion-slate-grey/50">
          Already have an account?{" "}
        </span>
        <Link
          className="text-[12px] font-bold text-hyperion-slate-grey/50 hover:text-hyperion-deep-sea transition-colors uppercase tracking-tight"
          to="/login"
        >
          Login
        </Link>
      </div>
    </form>
  );
};
