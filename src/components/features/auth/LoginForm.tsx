import { Fingerprint, Key, LogIn } from "lucide-react";
import { InputField } from "../../shared/InputField";
import { Button } from "../../shared/Button";

export const LoginForm = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void =>
    e.preventDefault();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        text="Log In"
        icon={<LogIn className="w-5 h-5 text-white" />}
      ></Button>
    </form>
  );
};
