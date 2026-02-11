import { Fingerprint, Key, UserPlus, User } from "lucide-react";
import { InputField } from "../../shared/InputField";
import { Button } from "../../shared/Button";

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
    </form>
  );
};
