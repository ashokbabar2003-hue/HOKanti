import React, { useEffect, useRef } from "react";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

declare global {
  interface Window {
    onloadTurnstileCallback?: () => void;
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export const Turnstile: React.FC<TurnstileProps> = ({ siteKey, onVerify, onExpire, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Use refs to hold the latest callback references
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  // Update those refs using a separate useEffect
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    if (!siteKey) {
      console.error(
        "[Turnstile] siteKey is missing or empty. Cannot initialize Cloudflare Turnstile.",
      );
      return;
    }

    // 1. Define global callback for script load
    window.onloadTurnstileCallback = () => {
      if (containerRef.current && window.turnstile) {
        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => onVerifyRef.current(token),
            "expired-callback": () => onExpireRef.current?.(),
            "error-callback": () => onErrorRef.current?.(),
            theme: "light",
          });
          widgetIdRef.current = id;
        } catch (e) {
          console.error("[Turnstile] render error:", e);
        }
      }
    };

    // 2. Load the script if not already loaded
    const scriptId = "cloudflare-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else if (window.turnstile && containerRef.current) {
      // Script is already loaded, render immediately
      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onVerifyRef.current(token),
          "expired-callback": () => onExpireRef.current?.(),
          "error-callback": () => onErrorRef.current?.(),
          theme: "light",
        });
        widgetIdRef.current = id;
      } catch (e) {
        console.error("[Turnstile] immediate render error:", e);
      }
    }

    // Cleanup on unmount or siteKey change
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          // ignore error
        }
      }
    };
  }, [siteKey]);

  return <div ref={containerRef} className="flex justify-center my-3" />;
};
