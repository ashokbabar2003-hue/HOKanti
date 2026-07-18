import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ogImage from "@/assets/og-image.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { PHONE_DISPLAY, PHONE_TEL, whatsappLink } from "@/lib/contact";
import { Turnstile } from "@/components/site/Turnstile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us — House Of Kanti" },
      {
        name: "description",
        content:
          "Get in touch with House Of Kanti support team. Reach us via email, phone, WhatsApp or drop a message using our online contact form.",
      },
      { property: "og:title", content: "Contact Us — House Of Kanti" },
      {
        property: "og:description",
        content:
          "Get in touch with House Of Kanti support team. Reach us via email, phone, WhatsApp or drop a message.",
      },
      { property: "og:url", content: "https://houseofkanti.shop/contact-us" },
      { property: "og:image", content: `https://houseofkanti.shop${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: `https://houseofkanti.shop${ogImage}` },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.shop/contact-us" }],
  }),
  component: ContactUsPage,
});

function ContactUsPage() {
  const { lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  const { user, loading: authLoading } = useAuth();
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

  React.useEffect(() => {
    if (!import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      console.error(
        "VITE_TURNSTILE_SITE_KEY is missing! Cloudflare Turnstile site key is not configured.",
      );
    }
  }, []);

  React.useEffect(() => {
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
      console.log("STATE TOKEN", turnstileToken);
      console.log("STATE LENGTH", turnstileToken?.length);
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

  const handleWhatsAppInquiry = () => {
    const defaultText = `Hi House of Kanti! I have an inquiry from your Contact Us page. My name is ${formState.name || "Customer"}.`;
    window.open(whatsappLink(defaultText), "_blank");
  };

  return (
    <div className={`min-h-screen bg-background ${body}`}>
      <Header />
      <main id="contact-us-main">
        {/* Banner */}
        <section className="relative overflow-hidden bg-warm py-16 md:py-20" id="contact-hero">
          <div className="absolute inset-0 bg-hero-radial opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
              Reach Our Family
            </span>
            <h1
              className={`mt-3 ${display} text-4xl font-700 leading-tight text-foreground md:text-5xl`}
            >
              Contact Us
            </h1>
            <div className="mx-auto mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground/80">Effective Date:</strong> 15 July 2026
              </p>
              <span className="hidden sm:inline text-border">•</span>
              <p>
                <strong className="text-foreground/80">Last Updated:</strong> 15 July 2026
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" id="contact-content">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Contact Information Panel */}
            <div className="lg:col-span-5 space-y-8" id="contact-info-panel">
              <div className="space-y-3">
                <h2 className={`${display} text-3xl font-700 text-foreground`}>Let's Connect</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We craft each product lovingly and handle all customer requests with individual
                  attention. Find us through any of these communication channels:
                </p>
              </div>

              <div className="space-y-6">
                {/* Email Card */}
                <div className="flex gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-card hover:border-primary/40 transition">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      <a
                        href="mailto:support@houseofkanti.shop"
                        className="hover:text-primary transition-colors"
                      >
                        support@houseofkanti.shop
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Expect response within 24 hours.
                    </p>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="flex gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-card hover:border-primary/40 transition">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Phone Support
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      <a href={`tel:${PHONE_TEL}`} className="hover:text-primary transition-colors">
                        +91 {PHONE_DISPLAY}
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mon – Sat, 10:00 AM – 7:00 PM IST.
                    </p>
                  </div>
                </div>

                {/* Location Card */}
                <a
                  href="https://maps.google.com/?q=House+Of+Kanti,+Pune,+Maharashtra,+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-card hover:border-primary/40 hover:shadow-md transition text-left cursor-pointer"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Our Location
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-foreground">House Of Kanti</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pune, Maharashtra, India. (Click to view on Google Maps)
                    </p>
                  </div>
                </a>
              </div>

              {/* Direct WhatsApp button */}
              <button
                type="button"
                onClick={handleWhatsAppInquiry}
                className="w-full flex items-center justify-center gap-2.5 rounded-full bg-herb text-white py-3.5 px-6 font-semibold shadow-soft hover:bg-herb/90 transition-all text-sm cursor-pointer"
                id="contact-whatsapp-btn"
              >
                <MessageSquare className="h-4.5 w-4.5" />
                Quick Inquiry on WhatsApp
              </button>
            </div>

            {/* Direct Form Panel */}
            <div className="lg:col-span-7" id="contact-form-panel">
              <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-card">
                {isSubmitted ? (
                  <div className="text-center py-12 space-y-4" id="contact-success-state">
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
                  <div className="space-y-5 animate-pulse" id="contact-loading-skeleton">
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
                  <form onSubmit={handleSubmit} className="space-y-5" id="contact-form-element">
                    <h3
                      className={`${display} text-2xl font-600 text-foreground border-b border-border/40 pb-3`}
                    >
                      Drop Us a Message
                    </h3>

                    {user && hasPreviousInquiries && (
                      <div
                        className="text-xs text-muted-foreground bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 flex items-center gap-2"
                        id="contact-logged-in-note"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>
                          Logged in as:{" "}
                          <strong className="text-foreground">
                            {formState.name || user.email?.split("@")[0]}
                          </strong>{" "}
                          ({user.email})
                        </span>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
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

                      <div className="space-y-1.5">
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
                      <div className="space-y-1.5">
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

                      <div className="space-y-1.5">
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
                      <div className="space-y-1.5" id="contact-userid-container">
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

                    <div className="space-y-1.5">
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
                        rows={5}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        placeholder="Write details of your inquiry here..."
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <Turnstile
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
                      onVerify={(token) => {
                        console.log("CALLBACK TOKEN", token);
                        console.log("CALLBACK LENGTH", token.length);
                        setTurnstileToken(token);
                      }}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                    />

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
        </section>
      </main>
      <Footer />
    </div>
  );
}
