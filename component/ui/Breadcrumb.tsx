"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/admin" className="transition-colors hover:text-primary">
        Home
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const label =
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="font-semibold text-foreground">{label}</span>
            ) : (
              <Link href={href} className="transition-colors hover:text-primary">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
