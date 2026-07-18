import { createFileRoute } from "@tanstack/react-router";
import heroPoster from "@/assets/products/ubtan-1.webp";
import ogImage from "@/assets/og-image.jpg";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Features } from "@/components/site/Features";
import { Products } from "@/components/site/Products";
import { WhyKanti } from "@/components/site/WhyKanti";
import { Offers } from "@/components/site/Offers";
import { Hampers } from "@/components/site/Hampers";
import { HowItWorks } from "@/components/site/HowItWorks";
import { FoundersNote } from "@/components/site/FoundersNote";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kanti — Natural Ayurvedic Skincare & Gift Hampers" },
      {
        name: "description",
        content:
          "Handcrafted Ayurvedic skincare — ubtan, face masks, soaps, oils & gift hampers. WhatsApp checkout, intro pricing.",
      },
      { property: "og:title", content: "Kanti — Where Purity Meets Glow" },
      {
        property: "og:description",
        content:
          "Handcrafted Ayurvedic skincare and custom gift hampers. WhatsApp checkout, intro pricing.",
      },
      { property: "og:url", content: "https://houseofkanti.ai.studio/" },
      { property: "og:image", content: `https://houseofkanti.ai.studio${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "House Of Kanti — Where Purity Meets Glow" },
      { name: "twitter:image", content: `https://houseofkanti.ai.studio${ogImage}` },
    ],
    links: [
      { rel: "canonical", href: "https://houseofkanti.ai.studio/" },
      { rel: "preload", as: "image", href: heroPoster, fetchPriority: "high" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "House Of Kanti",
              url: "https://houseofkanti.ai.studio/",
              logo: "https://houseofkanti.ai.studio/favicon.ico",
            },
            {
              "@type": "WebSite",
              name: "House Of Kanti",
              url: "https://houseofkanti.ai.studio/",
            },
            {
              "@type": "ItemList",
              itemListElement: [
                {
                  "@type": "Product",
                  name: "Kanti Ubtan — The Natural Cleanser",
                  offers: {
                    "@type": "Offer",
                    price: "349",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "Product",
                  name: "Kanti Face Pack — The Detox Ritual",
                  offers: {
                    "@type": "Offer",
                    price: "349",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "Product",
                  name: "Kanti Kumkumadi Night — The Overnight Elixir",
                  offers: {
                    "@type": "Offer",
                    price: "449",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "Product",
                  name: "Kanti Bath Salt — The Spa Sanctuary",
                  offers: {
                    "@type": "Offer",
                    price: "299",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "Product",
                  name: "Kanti Ancient Glow Soap",
                  offers: {
                    "@type": "Offer",
                    price: "199",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                  },
                },
              ].map((p, i) => ({ "@type": "ListItem", position: i + 1, item: p })),
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Products />
        <WhyKanti />
        <Offers />
        <Hampers />
        <HowItWorks />
        <FoundersNote />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
