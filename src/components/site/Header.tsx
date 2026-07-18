import { Link, useLocation } from "@tanstack/react-router";
import { ShoppingBag, User, LogIn, Languages, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";
import { ThemeSelector } from "./ThemeSelector";
import logo from "@/assets/images/brand_logo-1.png";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Header() {
  const { user } = useAuth();
  const { count } = useCart();
  const { lang, setLang, t } = useLang();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  // Auto-hide mobile header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down - hide
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - show immediately
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on any route change (Path, search, or hash)
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Robust back button/popstate integration: closes drawer on back navigation
  useEffect(() => {
    if (isDrawerOpen) {
      window.history.pushState({ drawerOpen: true }, "");
      const handlePopState = () => {
        setIsDrawerOpen(false);
      };
      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
        // Clean up state in case it was closed via UI interaction instead of browser back button
        if (window.history.state?.drawerOpen) {
          window.history.back();
        }
      };
    }
  }, [isDrawerOpen]);

  // Close drawer on screen resize (above mobile breakpoint) and device orientation changes
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsDrawerOpen(false);
      }
    };
    const handleOrientation = () => {
      setIsDrawerOpen(false);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientation);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, [isDrawerOpen]);

  // 20-second inactivity auto-close timer with user interaction resetters
  useEffect(() => {
    if (!isDrawerOpen) return;

    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsDrawerOpen(false);
      }, 20000);
    };

    // Initialize timer
    resetTimer();

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((evt) => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((evt) => {
        window.removeEventListener(evt, resetTimer);
      });
    };
  }, [isDrawerOpen]);

  // Premium, iOS-safe and layout-shift-free body scroll lock
  useEffect(() => {
    if (isDrawerOpen) {
      // Save scroll position
      scrollPositionRef.current = window.scrollY;

      // Lock scroll with styles that prevent iOS bounce and scroll bleed
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll
      const savedScroll = scrollPositionRef.current;
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      document.body.style.overflow = "";
      window.scrollTo(0, savedScroll);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Accessibility: Focus Trap, ESC close, and restore focus to trigger
  useEffect(() => {
    if (!isDrawerOpen) return;

    // Focus the first element inside the drawer
    const focusableElements = drawerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusableElements && focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    const hamburgerEl = hamburgerRef.current;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the triggering hamburger button
      hamburgerEl?.focus();
    };
  }, [isDrawerOpen]);

  // Robust click-away and touch-away outside detection
  useEffect(() => {
    if (!isDrawerOpen) return;

    const currentDrawer = drawerRef.current;
    const currentHamburger = hamburgerRef.current;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (currentDrawer && !currentDrawer.contains(e.target as Node)) {
        // Avoid closing if user clicked the hamburger button itself (let its state handler decide)
        if (currentHamburger && currentHamburger.contains(e.target as Node)) {
          return;
        }
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isDrawerOpen]);

  const nav = [
    { to: "/about", label: t("nav.about") },
    { to: "/", hash: "products", label: t("nav.products") },
    { to: "/", hash: "hampers", label: t("nav.hampers") },
    { to: "/", hash: "how", label: t("nav.how") },
  ];

  const fontClass = lang === "mr" ? "font-marathi" : "font-sans";

  return (
    <header
      className={`sticky top-0 z-[100] border-b border-border/60 bg-background/80 backdrop-blur-md transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full md:translate-y-0"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2 md:gap-3 shrink-0 select-none">
          <img
            src={logo}
            alt="House Of Kanti"
            className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover shadow-soft shrink-0"
          />
          <span className="flex flex-col leading-tight shrink-0">
            <span
              className={`${lang === "mr" ? "font-marathi-display" : "font-display"} font-700 tracking-tight text-primary text-[clamp(0.95rem,4.5vw,1.15rem)] md:text-[clamp(1.1rem,2vw,1.3rem)] lg:text-xl shrink-0 whitespace-nowrap md:whitespace-normal`}
            >
              <span className="inline md:block lg:inline whitespace-nowrap">
                {lang === "mr" ? "हाऊस ऑफ" : "House Of"}{" "}
              </span>
              <span className="inline whitespace-nowrap">{lang === "mr" ? "कांती" : "Kanti"}</span>
            </span>
            <span
              className={`-mt-0.5 hidden lg:inline text-[9px] uppercase tracking-[0.22em] text-muted-foreground ${fontClass}`}
            >
              {t("brand.tagline")}
            </span>
          </span>
        </Link>
        <nav
          className={`hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex ${fontClass}`}
        >
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              hash={n.hash}
              className="transition-colors hover:text-primary whitespace-nowrap"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="relative hidden md:inline-flex items-center rounded-full border border-border bg-background/80 p-0.5 text-[10px] sm:text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-label="English"
              className={`rounded-full px-2 py-1 lg:px-3 lg:py-1.5 transition ${lang === "en" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("mr")}
              aria-label="Marathi"
              className={`rounded-full px-2 py-1 lg:px-3 lg:py-1.5 transition font-marathi ${lang === "mr" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
            >
              मर
            </button>
            <Languages
              className="ml-1 mr-2 hidden h-3.5 w-3.5 text-muted-foreground lg:block"
              aria-hidden
            />
          </div>

          <div className="hidden md:block">
            <ThemeSelector />
          </div>

          <Link
            to="/cart"
            className="relative inline-flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border border-border text-foreground/80 transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="sr-only">
              - {count} {count === 1 ? "item" : "items"} in cart
            </span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[8px] sm:text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Link
              to="/account"
              className={`hidden md:inline-flex h-8 w-8 md:h-10 md:w-auto items-center justify-center md:gap-2 rounded-full bg-primary md:px-4 md:py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90 shrink-0 ${fontClass}`}
              aria-label={t("nav.account")}
            >
              <User className="h-4 w-4" />
              <span className="hidden lg:inline">{t("nav.account")}</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className={`hidden md:inline-flex h-8 w-8 md:h-10 md:w-auto items-center justify-center md:gap-2 rounded-full bg-primary md:px-4 md:py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90 shrink-0 ${fontClass}`}
              aria-label={t("nav.login")}
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden lg:inline">{t("nav.login")}</span>
            </Link>
          )}

          {/* Hamburger menu button for Mobile/Tablet */}
          <button
            type="button"
            ref={hamburgerRef}
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex h-8 w-8 md:hidden items-center justify-center rounded-full border border-border text-foreground/80 transition hover:border-primary/40 hover:text-primary shrink-0"
            aria-label="Open Navigation Menu"
            aria-expanded={isDrawerOpen}
            aria-controls="mobile-navigation-drawer"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Premium Navigation Drawer (Mobile/Tablet Only) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm md:hidden"
            />
            {/* Drawer container */}
            <motion.div
              ref={drawerRef}
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-hidden={!isDrawerOpen}
              aria-label={lang === "mr" ? "नेव्हिगेशन मेनू" : "Navigation Menu"}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-[120] flex h-[100dvh] w-[280px] sm:w-[320px] flex-col justify-between border-l border-amber-200/40 dark:border-amber-900/40 bg-[#FDFBF7] dark:bg-[#121110] p-6 shadow-2xl md:hidden"
            >
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header inside drawer */}
                <div className="flex items-center justify-between border-b border-border/40 pb-4 shrink-0">
                  <span className={`text-base font-bold text-primary ${fontClass}`}>
                    {lang === "mr" ? "नेव्हिगेशन" : "Navigation"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                    aria-label="Close Menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Vertical menu links */}
                <div className="flex-1 overflow-y-auto py-6 pr-1 space-y-5">
                  <nav className="flex flex-col gap-4">
                    {nav.map((n) => (
                      <Link
                        key={n.label}
                        to={n.to}
                        hash={n.hash}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`text-base font-semibold text-foreground/80 transition-colors hover:text-primary pb-2 border-b border-border/10 ${fontClass}`}
                      >
                        {n.label}
                      </Link>
                    ))}

                    {user ? (
                      <Link
                        to="/account"
                        onClick={() => setIsDrawerOpen(false)}
                        className={`text-base font-semibold text-foreground/80 transition-colors hover:text-primary pb-2 border-b border-border/10 ${fontClass}`}
                      >
                        {t("nav.account")}
                      </Link>
                    ) : (
                      <Link
                        to="/auth"
                        onClick={() => setIsDrawerOpen(false)}
                        className={`text-base font-semibold text-foreground/80 transition-colors hover:text-primary pb-2 border-b border-border/10 ${fontClass}`}
                      >
                        {t("nav.login")}
                      </Link>
                    )}
                  </nav>

                  {/* Choose Your Ritual (ThemeSelector) inside Drawer */}
                  <div className="pt-4 border-t border-border/40 md:hidden">
                    <span
                      className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3 ${fontClass}`}
                    >
                      {lang === "mr" ? "विधी निवडा" : "Choose Your Ritual"}
                    </span>
                    <ThemeSelector variant="drawer" />
                  </div>

                  {/* Language Selector in Drawer */}
                  <div className="pt-4 border-t border-border/40 md:hidden">
                    <span
                      className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3 ${fontClass}`}
                    >
                      {lang === "mr" ? "भाषा निवडा" : "Select Language"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLang("en");
                          setIsDrawerOpen(false);
                        }}
                        className={`flex-1 rounded-xl py-2 text-center text-xs font-semibold transition border ${lang === "en" ? "bg-primary text-primary-foreground border-primary shadow-soft" : "border-border text-muted-foreground hover:text-foreground bg-background/50"}`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLang("mr");
                          setIsDrawerOpen(false);
                        }}
                        className={`flex-1 rounded-xl py-2 text-center text-xs font-semibold font-marathi transition border ${lang === "mr" ? "bg-primary text-primary-foreground border-primary shadow-soft" : "border-border text-muted-foreground hover:text-foreground bg-background/50"}`}
                      >
                        मराठी
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer with branding and tagline */}
              <div className="border-t border-border/40 pt-4 flex flex-col gap-1 shrink-0">
                <span className="font-display text-base font-700 tracking-tight text-primary">
                  {lang === "mr" ? "हाऊस ऑफ कांती" : "House Of Kanti"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground leading-tight">
                  {t("brand.tagline")}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
