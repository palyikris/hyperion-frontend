import { LoginForm } from "../components/features/auth/LoginForm";
import { Title } from "../components/shared/Title";

export const LoginPage = () => {
  return (
    <div className="h-screen flex flex-col md:flex-row relative bg-hyperion-cream overflow-hidden">
      {/* Left Column: Stylized Scene */}
      <div className="hidden md:flex md:w-4/7 xl:w-3/5 relative overflow-hidden bg-gradient-to-b from-hyperion-deep-sea to-hyperion-deep-sea">
        <img
          src="/public/forest.png"
          alt="Auth image showing animals looking at trash"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto h-full object-cover z-10 "
        />
        <div
          className="w-3/4 h-2/3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-hyperion-forest/40"
          style={{
            borderRadius: "30% 70% 70% 30% / 48% 30% 70% 52% ",
          }}
        ></div>
        {/* Curvy Divider */}
        <div className="absolute top-[-10%] -right-10 h-[120%] w-90 z-20">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 1000"
          >
            <path
              className="fill-hyperion-cream"
              d="M100 0 Q 50 80, 65 190 Q 75 320, 45 430 Q 30 560, 72 680 Q 105 790, 40 900 Q 20 950, 100 1000 L 100 0 Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Right Column: Login Card */}
      <div className="flex-1 flex flex-col justify-center items-center relative">
        <div className="w-full z-10 pr-4">
          <div className="w-full flex justify-center items-center flex-col">
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-10 left-1/2 h-20 w-56 -translate-x-1/2 rounded-full bg-hyperion-forest/60 blur-3xl" />
              <Title
                text="HYPERION"
                colorFrom="hyperion-forest"
                colorVia="hyperion-deep-sea"
                colorTo="hyperion-cool-aqua"
                size="5xl"
              ></Title>
            </div>
            <img
              src="/public/logo.png"
              alt="Hyperion logo image"
              width={50}
              className="my-5"
            />
          </div>
          <div
            className="p-16 border border-hyperion-muted-gold/60 bg-white/50 backdrop-blur-sm relative"
            style={{
              borderRadius: "31% 69% 47% 53% / 61% 30% 70% 39% ",
              boxShadow: "rgba(26,95,84, 0.3) 0px 1px 4px",
            }}
          >
            <div
              className="absolute -z-1 top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-hyperion-deep-sea/5"
              style={{
                borderRadius: "73% 27% 70% 30% / 36% 69% 31% 64% ",
              }}
            ></div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
