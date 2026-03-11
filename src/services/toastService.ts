import { toast } from "sonner";

export const toastService = {
  success: (message: string, description = "", duration = 2000) => {
    toast.success(message, {
      description,
      style: {
        background: "var(--color-hyperion-deep-sea)",
        color: "var(--color-hyperion-cream)",
        border: "1px solid var(--color-hyperion-sage-mint)",
      },
      duration: duration,
      // Ensures the 'X' and icons are visible against the dark background
      className: "hyperion-toast-success",
    });
  },

  error: (message: string, description = "", duration = 2000) => {
    toast.error(message, {
      description,
      style: {
        background: "var(--color-hyperion-burnt-orange)",
        color: "var(--color-hyperion-cream)",
        border: "1px solid var(--color-hyperion-muted-gold)",
      },
      duration: duration,
    });
  },

  info: (message: string, description = "", duration = 2000) => {
    toast.info(message, {
      description,
      style: {
        background: "var(--color-hyperion-soft-sky)",
        color: "var(--color-hyperion-forest)",
        border: "1px solid var(--color-hyperion-cool-aqua)",
      },
      duration: duration,
    });
  },

  // Specialized AI processing toast
  aiAction: (message: string) => {
    toast(message, {
      icon: "🤖",
      style: {
        background: "var(--color-hyperion-forest)",
        color: "var(--color-hyperion-soft-sky)",
        border: "1px solid var(--color-hyperion-muted-gold)",
      },
      duration: 2000,
    });
  },
};
