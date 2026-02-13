import React, { useState, useEffect } from "react";

const LoadingScreen = () => {
  const [statusIndex, setStatusIndex] = useState(0);
  const statusMessages = [
    "Counting tree canopies",
    "Looking for some trash",
    "Watching out for nice flowers",
    "Protecting your natural beauties",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes pulse-blob {
          0%, 100% { transform: scale(1); border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
          50% { transform: scale(1.03); border-radius: 50% 50% 60% 40% / 50% 50% 50% 50%; }
        }
        @keyframes slow-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes shimmer { 0% { opacity: 0.2; } 50% { opacity: 0.6; } 100% { opacity: 0.2; } }
        
        .animate-pulse-blob { animation: pulse-blob 6s ease-in-out infinite; }
        .animate-slow-spin { animation: slow-spin 18s linear infinite; }
        .animate-floaty { animation: floaty 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 5s ease-in-out infinite; }
      `}</style>

      <div className="bg-hyperion-deep-sea min-h-screen flex flex-col items-center justify-center overflow-hidden relative text-hyperion-cream">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-hyperion-soft-sky/10 blur-3xl animate-shimmer" />
          <div className="absolute -bottom-48 -right-24 w-[32rem] h-[32rem] rounded-full bg-hyperion-sage-mint/10 blur-3xl animate-shimmer" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.05),transparent_45%)]" />
        </div>
        <main className="relative flex flex-col items-center justify-center w-full max-w-2xl px-6 z-10">
          {/* Central Asset Container */}
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
            {/* The Organic Blob */}
            <div
              className="absolute inset-0 bg-hyperion-cream opacity-95 shadow-2xl animate-pulse-blob"
              style={{ borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%" }}
            />
            <div className="absolute inset-2 rounded-full border border-hyperion-soft-sky/30 animate-slow-spin" />
            <div className="absolute inset-8 rounded-full border border-hyperion-sage-mint/20 animate-slow-spin" style={{ animationDirection: "reverse" }} />

            <div className="relative z-10 flex flex-col items-center animate-floaty">
              {/* Drone Asset */}
              <div className="flex justify-center items-center">
                <img
                  alt="Hyperion logo"
                  className="w-48 h-48 sm:w-60 sm:h-60 object-contain drop-shadow-xl"
                  src="/public/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Progress and Branding */}
          <section className="mt-12 w-full flex flex-col items-center text-center">
            <h1 className="text-xl sm:text-2xl font-light tracking-[0.4em] uppercase mb-2">
              Hyperion{" "}
              <span className="text-hyperion-sage-mint font-bold">Systems</span>
            </h1>

            <p className="text-xs sm:text-sm mb-8 tracking-[0.25em] h-5 text-hyperion-soft-sky transition-opacity duration-500">
              {statusMessages[statusIndex]}...
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-2 h-8 bg-hyperion-sage-mint rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="w-2 h-8 bg-hyperion-soft-sky rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-8 bg-hyperion-cream rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-hyperion-cream/70">
              <span className="h-[1px] w-10 bg-hyperion-cream/30" />
              Content appearing soon
              <span className="h-[1px] w-10 bg-hyperion-cream/30" />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default LoadingScreen;
