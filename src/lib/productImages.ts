import hamper from "@/assets/hamper.webp";

import ubtan1 from "@/assets/products/ubtan-1.webp";
import ubtan2 from "@/assets/products/ubtan-2.webp";
import ubtan3 from "@/assets/products/ubtan-3.webp";

import bathsalt1 from "@/assets/products/bathsalt-1.webp";
import bathsalt2 from "@/assets/products/bathsalt-2.webp";
import bathsalt3 from "@/assets/products/bathsalt-3.webp";
import bathsalt4 from "@/assets/products/bathsalt-4.webp";

import soap1 from "@/assets/products/soap-new-1.webp";
import soap2 from "@/assets/products/soap-new-2.webp";
import soap3 from "@/assets/products/soap-3.webp";

import facemask1 from "@/assets/products/facemask-new-1.webp";
import facemask2 from "@/assets/products/facemask-new-2.webp";

import faceserum1 from "@/assets/products/faceserum-1.webp";
import faceserum2 from "@/assets/products/faceserum-2.webp";

const ubtan = ubtan1;

// Multiple images per product slug (for carousels)
const gallery: Record<string, string[]> = {
  ubtan: [ubtan1, ubtan2, ubtan3],
  "bath-salt": [bathsalt1, bathsalt2, bathsalt3, bathsalt4],
  soap: [soap1, soap2, soap3],
  "face-mask": [facemask1, facemask2],
  "face-oil": [faceserum1, faceserum2],
  "face-serum": [faceserum1, faceserum2],
  hamper: [hamper],
};

// Legacy DB image_url path → first gallery image
const map: Record<string, string> = {
  "/src/assets/product-ubtan.jpg": ubtan,
  "/src/assets/product-facemask.jpg": facemask2,
  "/src/assets/product-bathsalt.jpg": bathsalt1,
  "/src/assets/product-soap.jpg": soap1,
  "/src/assets/product-faceoil.jpg": faceserum1,
  "/src/assets/hamper.jpg": hamper,
};

export function resolveProductImage(url: string | null | undefined): string {
  if (!url) return ubtan;
  return map[url] ?? url;
}

export function resolveProductImages(
  slug: string | null | undefined,
  fallbackUrl?: string | null,
): string[] {
  if (slug && gallery[slug]) return gallery[slug];
  return [resolveProductImage(fallbackUrl)];
}
