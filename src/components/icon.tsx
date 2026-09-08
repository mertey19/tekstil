export function Icon({
  name = "arrow",
  size = 20,
  className = "",
}: {
  name?:
    | "arrow"
    | "search"
    | "menu"
    | "close"
    | "chevron"
    | "filter"
    | "check"
    | "mail"
    | "phone"
    | "pin"
    | "grid"
    | "user";
  size?: number;
  className?: string;
}) {
  const paths = {
    user: "M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "m6 6 12 12M6 18 18 6",
    chevron: "m9 5 7 7-7 7",
    filter: "M3 6h18M6 12h12M9 18h6",
    check: "m5 12 4 4L19 6",
    mail: "M3 5h18v14H3z m0 0 9 8 9-8",
    phone: "M7 3H3c-1 10 8 19 18 18v-4l-5-2-2 2-7-7 2-2z",
    pin: "M12 22s8-8 8-13a8 8 0 0 0-16 0c0 5 8 13 8 13ZM15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  };
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
