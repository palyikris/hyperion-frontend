import { LoginForm } from "../components/features/auth/LoginForm";
import { Title } from "../components/shared/Title";

export const LoginPage = () => {
  return (
    <div className="h-screen flex flex-col lg:flex-row relative bg-hyperion-cream overflow-hidden">
      {/* Left Column: Stylized Scene */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-b from-hyperion-deep-sea to-hyperion-deep-sea">
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
        <div className="absolute top-[-10%] -right-10 h-[120%] w-80 z-20">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 1000"
          >
            <path
              className="fill-hyperion-cream"
              d="M100 0 Q 70 120, 78 210 Q 88 300, 70 390 Q 52 480, 78 560 Q 96 640, 70 725 Q 52 810, 80 900 Q 95 965, 100 1000 L 100 0 Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Right Column: Login Card */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        <div className="absolute top-1/4 right-10 w-32 h-32 bg-hyperion-deep-sea/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-hyperion-cool-aqua/10 rounded-full blur-3xl" />
        <div className="w-full z-10">
          <div className="w-full flex justify-center items-center flex-col">
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-10 left-1/2 h-20 w-56 -translate-x-1/2 rounded-full bg-hyperion-forest/25 blur-3xl" />
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
            className="p-16 shadow-[0_20px_50px_rgba(26,95,84,0.1)] border border-white bg-white/50 backdrop-blur-sm relative"
            style={{
              borderRadius: "31% 69% 47% 53% / 61% 30% 70% 39% ",
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
