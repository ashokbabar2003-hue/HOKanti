import React from "react";
import { AlertCircle, ShieldAlert, Sparkles } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export function ProductSafety() {
  const { lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  return (
    <div
      className={`rounded-2xl border border-border/60 bg-cream/30 p-5 md:p-6 ${body}`}
      id="product-safety-disclaimer"
    >
      <div className="flex items-center gap-2.5 mb-4 border-b border-border/40 pb-3">
        <ShieldAlert className="h-5 w-5 text-terracotta shrink-0" />
        <h3 className={`${display} text-base font-600 text-foreground uppercase tracking-wider`}>
          {lang === "mr" ? "उत्पादन सुरक्षा मार्गदर्शक तत्त्वे" : "Product Safety & Care"}
        </h3>
      </div>

      <ul className="space-y-3 text-sm text-muted-foreground">
        <li className="flex items-start gap-2.5">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" />
          <span>
            <strong className="text-foreground">External Use Only:</strong>{" "}
            {lang === "mr"
              ? "फक्त बाह्य वापरासाठी."
              : "This cosmetic product is formulated strictly for topical skin application. Do not ingest."}
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" />
          <span>
            <strong className="text-foreground">Perform a Patch Test:</strong>{" "}
            {lang === "mr"
              ? "वापरण्यापूर्वी पॅच टेस्ट करा."
              : "Apply a small amount on your inner forearm and monitor for 24 hours before full face/body application."}
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" />
          <span>
            <strong className="text-foreground">Avoid Eye Contact:</strong>{" "}
            {lang === "mr"
              ? "डोळ्यांशी संपर्क टाळा."
              : "Keep away from eyes, nostrils, and mucous membranes. Flush thoroughly with cool water if contact occurs."}
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" />
          <span>
            <strong className="text-foreground">Store Appropriately:</strong>{" "}
            {lang === "mr"
              ? "थंड आणि कोरड्या जागी ठेवा."
              : "Keep in a cool, dry place away from direct sunlight, humidity, and heat sources to preserve organic active herbs."}
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" />
          <span>
            <strong className="text-foreground">Keep Away From Children:</strong>{" "}
            {lang === "mr"
              ? "मुलांपासून दूर ठेवा."
              : "Ensure jars and bottles are sealed tight and placed out of reach of infants and young children."}
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" />
          <span>
            <strong className="text-foreground">Discontinue If Irritation Occurs:</strong>{" "}
            {lang === "mr"
              ? "त्रास झाल्यास वापर बंद करा."
              : "In the rare event of redness, burning, itching, or hives, discontinue use immediately and consult a dermatologist."}
          </span>
        </li>
      </ul>
    </div>
  );
}
