import { toast } from "sonner";


export const toastService = {
  success: (message: string, description = "") => {
    toast.success(message, {
      description,
      style: {
        background: "var(--color-hyperion-deep-sea)",
        color: "var(--color-hyperion-cream)",
        border: "1px solid var(--color-hyperion-sage-mint)",
      },
      // Ensures the 'X' and icons are visible against the dark background
      className: "hyperion-toast-success",
    });
  },

  error: (message: string, description = "") => {
    toast.error(message, {
      description,
      style: {
        background: "var(--color-hyperion-burnt-orange)",
        color: "var(--color-hyperion-cream)",
        border: "1px solid var(--color-hyperion-muted-gold)",
      },
    });
  },

  info: (message: string, description = "") => {
    toast.info(message, {
      description,
      style: {
        background: "var(--color-hyperion-soft-sky)",
        color: "var(--color-hyperion-forest)",
        border: "1px solid var(--color-hyperion-cool-aqua)",
      },
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
    });
  },
};
