import { useState, useEffect } from "react";
import { Mail, Phone, Instagram, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_NUMBER, whatsappLink } from "@/lib/contact";
import { useLang, type DictKey } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Turnstile } from "@/components/site/Turnstile";

export function Contact() {
  const { t, lang } = useLang();
  const { user, loading: authLoading } = useAuth();

  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  const [profileLoading, setProfileLoading] = useState(false);
  const [hasPreviousInquiries, setHasPreviousInquiries] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    if (!import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      console.error(
        "VITE_TURNSTILE_SITE_KEY is missing! Cloudflare Turnstile site key is not configured.",
      );
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    Promise.all([
      supabase.from("profiles").select("full_name, phone").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("contact_messages")
        .select("id")
        .eq("email", user.email || "")
        .limit(1),
    ])
      .then(([{ data: profileData, error: profileError }, { data: messagesData }]) => {
        if (profileError) {
          console.error("Failed to fetch user profile for contact form:", profileError);
        }

        const fullName = profileData?.full_name || user.user_metadata?.full_name || "";
        const phoneNum = profileData?.phone || "";
        const emailAddress = user.email || "";

        setFormState((prev) => ({
          ...prev,
          name: fullName,
          email: emailAddress,
          phone: phoneNum,
        }));

        if (messagesData && messagesData.length > 0) {
          setHasPreviousInquiries(true);
        }
      })
      .catch((err) => {
        console.error("Error during contact us auto-populate:", err);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      setError("Please fill out all required fields.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formState, turnstileToken, userId: user?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit message. Please try again.");
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const channels: { icon: typeof Phone; labelKey: DictKey; value: string; href: string }[] = [
    { icon: Phone, labelKey: "contact.phone", value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
    {
      icon: MessageCircle,
      labelKey: "contact.wa",
      value: t("contact.wa.value"),
      href: `https://wa.me/${WHATSAPP_NUMBER}`,
    },
    {
      icon: Mail,
      labelKey: "contact.email",
      value: "support@houseofkanti.shop",
      href: "mailto:support@houseofkanti.shop",
    },
    {
      icon: Instagram,
      labelKey: "contact.ig",
      value: "@house_of_kanti",
      href: "https://www.instagram.com/house_of_kanti/",
    },
  ];

  return (
    <section id="contact" className="relative overflow-hidden bg-warm py-20 md:py-28">
      <div className="absolute inset-0 bg-hero-radial opacity-70" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left Side: Info and Support Channels */}
          <div
            className="lg:col-span-5 space-y-8 flex flex-col justify-center"
            id="homepage-contact-info-block"
          >
            <div className="space-y-3 text-left">
              <span
                className={`${body} text-xs font-semibold uppercase tracking-[0.22em] text-terracotta block`}
              >
                {t("contact.eyebrow")}
              </span>
              <h2
                className={`${display} text-3xl sm:text-4xl font-700 leading-[1.1] text-foreground`}
              >
                {t("contact.title.1")}{" "}
                <span className="italic text-primary">{t("contact.title.2")}</span>
              </h2>
              <p className={`${body} text-muted-foreground text-sm leading-relaxed mt-4`}>
                {t("contact.subtitle")}
              </p>
            </div>

            {/* Channels Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {channels.map(({ icon: Icon, labelKey, value, href }) => (
                <a
                  key={labelKey}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-background/70 p-5 shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sun text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <span
                      className={`${body} block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground`}
                    >
                      {t(labelKey)}
                    </span>
                    <span
                      className={`${display} text-sm sm:text-base font-600 text-foreground break-all mt-0.5 block`}
                    >
                      {value}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right Side: Contact Us Form */}
          <div className="lg:col-span-7" id="homepage-contact-form-card">
            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-card backdrop-blur-sm">
              {isSubmitted ? (
                <div className="text-center py-12 space-y-4" id="homepage-contact-success-state">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2 border border-emerald-100">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className={`${display} text-2xl font-700 text-foreground`}>
                    Message Sent Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Thank you for contacting House Of Kanti. We have received your message and our
                    skincare specialists will email you within 24 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      if (user) {
                        setFormState({
                          name: formState.name,
                          email: formState.email,
                          phone: formState.phone,
                          subject: "",
                          message: "",
                        });
                      } else {
                        setFormState({
                          name: "",
                          email: "",
                          phone: "",
                          subject: "",
                          message: "",
                        });
                      }
                      setTurnstileToken(null);
                    }}
                    className="mt-6 inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : authLoading || profileLoading ? (
                <div className="space-y-5 animate-pulse" id="homepage-contact-loading-skeleton">
                  <div className="h-8 bg-muted/60 rounded-xl w-1/3 mb-6" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="h-4 bg-muted/60 rounded w-1/4" />
                      <div className="h-10 bg-muted/60 rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-4 bg-muted/60 rounded w-1/3" />
                      <div className="h-10 bg-muted/60 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="h-4 bg-muted/60 rounded w-1/4" />
                      <div className="h-10 bg-muted/60 rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-4 bg-muted/60 rounded w-1/3" />
                      <div className="h-10 bg-muted/60 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-4 bg-muted/60 rounded w-1/4" />
                    <div className="h-32 bg-muted/60 rounded-xl" />
                  </div>
                  <div className="h-12 bg-muted/60 rounded-full w-full" />
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  id="homepage-contact-form-element"
                >
                  <h3
                    className={`${display} text-2xl font-600 text-foreground border-b border-border/40 pb-3 text-left`}
                  >
                    Drop Us a Message
                  </h3>

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-left">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 text-left">
                      <label
                        htmlFor="name-input"
                        className="text-xs font-semibold text-foreground/80"
                      >
                        Your Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        id="name-input"
                        required
                        disabled={isSubmitting}
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="e.g., Dipti Babar"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label
                        htmlFor="email-input"
                        className="text-xs font-semibold text-foreground/80"
                      >
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        id="email-input"
                        required
                        disabled={isSubmitting}
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="e.g., user@example.com"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 text-left">
                      <label
                        htmlFor="phone-input"
                        className="text-xs font-semibold text-foreground/80"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone-input"
                        disabled={isSubmitting}
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        placeholder="e.g., 9876543210"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label
                        htmlFor="subject-input"
                        className="text-xs font-semibold text-foreground/80"
                      >
                        Subject / Topic
                      </label>
                      <input
                        type="text"
                        id="subject-input"
                        disabled={isSubmitting}
                        value={formState.subject}
                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                        placeholder="e.g., Gift Hampers"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {user && (
                    <div className="space-y-1.5 text-left" id="homepage-contact-userid-container">
                      <label
                        htmlFor="userid-input"
                        className="text-xs font-semibold text-foreground/60 flex items-center gap-1"
                      >
                        Customer ID{" "}
                        <span className="text-xs text-muted-foreground">(Read-only)</span>
                      </label>
                      <input
                        type="text"
                        id="userid-input"
                        readOnly
                        value={user.id}
                        className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-xs font-mono text-muted-foreground outline-none cursor-not-allowed"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="message-input"
                      className="text-xs font-semibold text-foreground/80"
                    >
                      Message Content <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="message-input"
                      required
                      disabled={isSubmitting}
                      rows={4}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Write details of your inquiry here..."
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex justify-start">
                    <Turnstile
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
                      onVerify={(token) => {
                        console.log("HOMEPAGE CALLBACK TOKEN", token);
                        setTurnstileToken(token);
                      }}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 px-6 font-semibold shadow-soft hover:bg-primary/90 transition-all text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
