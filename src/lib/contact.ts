// Centralized brand contact info
export const WHATSAPP_NUMBER = "918806018688"; // intl format, no +
export const PHONE_DISPLAY = "88060 18688";
export const PHONE_TEL = "+918806018688";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
