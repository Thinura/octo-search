import Link from "next/link";
import ThemeToggle from "@/components/ui/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import Logo from "@/components/ui/logo";

export default function AppHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/?type=users" className="flex items-center gap-3" aria-label="Home">
        <Logo className="h-8 w-8" />
        <span className="text-sm font-semibold tracking-wide">Octo Search</span>
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          href="/?type=users"
          aria-label="Home"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" />
          </svg>
          Home
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          href="/favorites?type=users"
          aria-label="Favorites"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
          </svg>
          Favorites
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}
