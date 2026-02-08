export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="20" className="fill-foreground/10" />
      <circle cx="24" cy="24" r="18" className="stroke-foreground" strokeWidth="1.5" />
      <circle cx="18" cy="22" r="2.5" className="fill-foreground" />
      <circle cx="30" cy="22" r="2.5" className="fill-foreground" />
      <path
        d="M14 30c2.5 3 6 4.5 10 4.5S31.5 33 34 30"
        className="stroke-foreground"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 32c0 3 2 5 5 5"
        className="stroke-foreground/70"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M36 32c0 3-2 5-5 5"
        className="stroke-foreground/70"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
