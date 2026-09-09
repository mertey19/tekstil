import Link from "next/link";
import type { CmsContent } from "@/lib/cms-model";
import { whatsappLink } from "@/lib/contact";
import { SocialIcon } from "./social-icon";
import { Icon } from "./icon";

export function UtilityBar({
  whatsapp,
  social,
}: {
  whatsapp: string;
  social: CmsContent["settings"]["social"];
}) {
  const href = whatsappLink(whatsapp);
  const phone = whatsapp.replace(
    /^(\+90)(\d{3})(\d{3})(\d{2})(\d{2})$/,
    "$1 $2 $3 $4 $5",
  );
  return (
    <div className="utility-bar">
      <div className="container utility-inner">
        <div className="utility-social" aria-label="Sosyal bağlantılar">
          {(["facebook", "instagram", "linkedin"] as const).map((name) =>
            social[name] ? (
              <a
                key={name}
                href={social[name]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name === "facebook" ? "Facebook" : name === "instagram" ? "Instagram" : "LinkedIn"} (yeni sekmede)`}
              >
                <SocialIcon name={name} size={16} />
              </a>
            ) : null,
          )}
          {href && (
            <a
              className="utility-whatsapp"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp ile iletişim (yeni sekmede)"
            >
              <SocialIcon name="whatsapp" size={18} />
            </a>
          )}
        </div>
        <nav aria-label="Hızlı bağlantılar" className="utility-links">
          {href && (
            <a
              className="utility-phone"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${phone} · WhatsApp (yeni sekmede)`}
            >
              <SocialIcon name="whatsapp" size={17} />
              <span>{phone}</span>
            </a>
          )}
          <Link href="/blog">
            <Icon name="document" size={16} />
            Blog
          </Link>
          <Link href="/sss">
            <Icon name="help" size={16} />
            SSS
          </Link>
        </nav>
      </div>
    </div>
  );
}
