import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/contact";

export function FloatingWhatsApp() {
  const href = whatsappLink(siteConfig.whatsapp);
  if (!href) return null;

  return (
    <a
      className="floating-whatsapp"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp sohbetini aç (yeni sekmede)"
      title="WhatsApp’tan bize yazın"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2a9.91 9.91 0 0 0-8.58 14.86L2.05 22l5.26-1.38A9.9 9.9 0 0 0 12.04 22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.33a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 1 1 6.98 3.86Zm4.52-6.16c-.25-.13-1.47-.73-1.7-.81-.23-.09-.39-.13-.56.12-.16.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.13-1.04-.39-1.98-1.23-.73-.65-1.23-1.46-1.37-1.71-.15-.25-.02-.38.1-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.34-.77-1.84-.2-.48-.4-.42-.55-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.68 4.24 3.76.59.25 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.07-.11-.23-.17-.48-.29Z" />
      </svg>
    </a>
  );
}
