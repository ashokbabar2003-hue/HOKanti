import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme, THEMES, type ThemeId } from "@/hooks/use-theme";
import { useLang } from "@/contexts/LanguageContext";
import { Palette, Check, Moon, Sun, Sparkles, Flower2, Leaf, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface ThemeSelectorProps {
  variant?: "default" | "drawer";
}

export function ThemeSelector({ variant = "default" }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const { lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close when clicking outside the dropdown container
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close when pressing the Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsSheetOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when mobile bottom sheet is open
  useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSheetOpen]);

  const fontClass = lang === "mr" ? "font-marathi" : "font-sans";

  // Skincare ritual descriptive metadata - concise ingredients-focused
  const ritualInspirations: Record<
    ThemeId,
    {
      inspiration: string;
      marathiInspiration: string;
      colorGrad: string;
      icon: React.ReactNode;
    }
  > = {
    "classic-kanti": {
      inspiration: "Turmeric, Sandalwood & Saffron",
      marathiInspiration: "हळद, चंदन आणि केशर",
      colorGrad: "from-amber-100 to-orange-200 dark:from-amber-950 dark:to-orange-900/60",
      icon: <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    },
    "night-ritual": {
      inspiration: "Kumkumadi & Precious Night Herbs",
      marathiInspiration: "कुंकुमादी आणि रात्रीची वनौषधी",
      colorGrad: "from-slate-900 to-indigo-950/90 border border-indigo-800/20",
      icon: <Moon className="h-4 w-4 text-indigo-400" />,
    },
    "lotus-bloom": {
      inspiration: "Sacred Lotus & Pure Rose Water",
      marathiInspiration: "पवित्र कमळ आणि गुलाब पाणी",
      colorGrad: "from-rose-50 to-pink-100 dark:from-rose-950 dark:to-pink-900/60",
      icon: <Flower2 className="h-4 w-4 text-rose-500 dark:text-rose-400" />,
    },
    "forest-herbal": {
      inspiration: "Vetiver Pine, Neem & Wild Tulsi",
      marathiInspiration: "वाळा, कडुलिंब आणि रान तुळस",
      colorGrad: "from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900/60",
      icon: <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    },
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.innerWidth < 768) {
      setIsSheetOpen(true);
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  const renderThemeItems = (closeMenu: () => void) => {
    return THEMES.map((t) => {
      const isActive = theme === t.id;
      const ritualMeta = ritualInspirations[t.id];

      let previewFontFamily = "inherit";
      if (t.id === "classic-kanti") previewFontFamily = "'Playfair Display', serif";
      else if (t.id === "night-ritual") previewFontFamily = "'Cormorant Garamond', serif";
      else if (t.id === "lotus-bloom") previewFontFamily = "'Cinzel', serif";
      else if (t.id === "forest-herbal") previewFontFamily = "'Marcellus', serif";

      return (
        <button
          key={t.id}
          onClick={async () => {
            await setTheme(t.id);
            closeMenu();
          }}
          type="button"
          role="menuitem"
          className={`w-full text-left flex items-center justify-between rounded-xl transition-all duration-200 cursor-pointer ${
            isActive
              ? "bg-primary/10 border border-primary/20 p-2.5 shadow-sm"
              : "border border-transparent hover:bg-muted/40 hover:border-border/20 p-2 opacity-85 hover:opacity-100"
          }`}
          id={`theme-card-${t.id}`}
        >
          <div className="flex gap-2.5 items-center flex-1 min-w-0">
            {/* Product-inspired small illustration container */}
            <div
              className={`${
                isActive ? "h-8 w-8" : "h-7 w-7"
              } rounded-full bg-gradient-to-tr ${ritualMeta.colorGrad} flex items-center justify-center shrink-0 shadow-inner`}
            >
              {ritualMeta.icon}
            </div>

            {/* Ritual Text details */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`tracking-tight text-foreground ${
                    isActive ? "text-sm font-bold text-primary" : "text-xs font-semibold"
                  }`}
                  style={{ fontFamily: previewFontFamily }}
                >
                  {t.name}
                </span>
                {!isActive && (
                  <span className="text-[8px] text-muted-foreground/60 font-mono tracking-tighter">
                    {t.headingFont}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1`}
              >
                {lang === "mr" ? ritualMeta.marathiInspiration : ritualMeta.inspiration}
              </span>

              {/* Heading Font preview tag & color indicators */}
              {isActive && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] text-muted-foreground/85 font-mono uppercase tracking-wider bg-[#F5EFE6] dark:bg-zinc-800 px-1 py-0.2 rounded leading-none">
                    {t.headingFont}
                  </span>
                  {/* Mini Palette dots */}
                  <div className="flex items-center gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full border border-background shadow-inner"
                      style={{ backgroundColor: t.primaryColor }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full border border-background shadow-inner"
                      style={{ backgroundColor: t.accentColor }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active check indicator or theme status */}
          <div className="flex items-center justify-center shrink-0 ml-1">
            {isActive ? (
              <div className="h-5 w-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
            ) : t.isDark ? (
              <Moon className="h-3 w-3 text-muted-foreground/30" />
            ) : (
              <Sun className="h-3 w-3 text-muted-foreground/30" />
            )}
          </div>
        </button>
      );
    });
  };

  return (
    <div
      className={variant === "drawer" ? "w-full text-left" : "relative inline-block text-left"}
      ref={containerRef}
      id="theme-selector-container"
    >
      {/* Premium Trigger Button with "Choose Your Ritual" */}
      {variant === "drawer" ? (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={handleTriggerClick}
          className="relative flex w-full h-11 px-4 items-center gap-2.5 rounded-xl border border-border text-foreground/80 bg-background/50 hover:bg-background/80 hover:border-primary/50 hover:text-primary cursor-pointer transition-all duration-300"
          title="Personalize Skincare Ritual"
          aria-label="Skincare Ritual Customizer"
          aria-expanded={isOpen}
          id="theme-customizer-trigger"
        >
          <Palette className="h-4 w-4 text-primary shrink-0" />
          <span className={`text-xs font-semibold tracking-wide ${fontClass}`}>
            {lang === "mr" ? "विधी निवडा" : "Choose Your Ritual"}
          </span>
          <span className="absolute top-1/2 -translate-y-1/2 right-4 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/80 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </button>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={handleTriggerClick}
                className="relative inline-flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border border-border text-foreground/80 transition-all duration-300 hover:border-primary/50 hover:text-primary bg-background/50 backdrop-blur cursor-pointer"
                aria-label="Choose Your Ritual"
                aria-expanded={isOpen}
                id="theme-customizer-trigger"
              >
                <Palette className="h-4 w-4 md:h-[18px] md:w-[18px] text-primary shrink-0" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/80 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="center"
              className={`text-xs font-medium py-1 px-2.5 ${fontClass}`}
            >
              {lang === "mr" ? "विधी निवडा" : "Choose Your Ritual"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Floating Dropdown Panel (Desktop Only) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-[300px] origin-top-right rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-[#FDFBF7] dark:bg-[#121110] p-3 shadow-lg backdrop-blur-md z-[100] hidden md:block"
            id="theme-dropdown-panel"
          >
            {/* Elegant Header - Compact */}
            <div className="flex flex-col gap-0.5 pb-2 mb-2 border-b border-border/30">
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary/85">
                {lang === "mr" ? "तुमची विधी" : "Sensory Ritual"}
              </span>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {lang === "mr"
                  ? "त्वचा आणि मनासाठी कस्टमायझेशन"
                  : "Personalize the sensory aura of your journey."}
              </p>
            </div>

            {/* List of Luxury Rituals */}
            <div
              className="space-y-1.5 max-h-[48vh] overflow-y-auto pr-0.5 scrollbar-thin"
              role="menu"
            >
              {renderThemeItems(() => setIsOpen(false))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-Up Bottom Sheet (Mobile & Tablet Only) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isSheetOpen && (
              <>
                {/* Backdrop with blur */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSheetOpen(false)}
                  className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm md:hidden"
                />
                {/* Bottom Sheet Container */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed bottom-0 left-0 right-0 z-[140] h-[52%] rounded-t-[2.5rem] border-t border-amber-200/40 dark:border-amber-900/40 bg-[#FDFBF7] dark:bg-[#121110] p-6 shadow-2xl md:hidden flex flex-col"
                  style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
                  id="theme-mobile-bottom-sheet"
                >
                  {/* Drag handle/affordance indicator */}
                  <div className="mx-auto w-12 h-1.5 rounded-full bg-border/80 mb-5 shrink-0" />

                  {/* Elegant Header */}
                  <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4 shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary/85">
                        {lang === "mr" ? "तुमची विधी" : "Sensory Ritual"}
                      </span>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {lang === "mr"
                          ? "त्वचा आणि मनासाठी कस्टमायझेशन"
                          : "Personalize the sensory aura of your journey."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground shrink-0"
                      aria-label="Close Sensory Ritual Panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Scrollable List */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 scrollbar-thin">
                    {renderThemeItems(() => setIsSheetOpen(false))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
