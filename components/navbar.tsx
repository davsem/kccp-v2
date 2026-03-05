"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBasket } from "@/lib/basket-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/pitch", label: "The Pitch" },
  { href: "/basket", label: "Basket" },
];

export function Navbar() {
  const pathname = usePathname();
  const { count } = useBasket();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span className="font-semibold tracking-tight">Khalsa Community Pitch</span>
        <nav className="flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
              {label === "Basket" && count > 0 && (
                <Badge className="ml-1.5" variant="secondary">
                  {count}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
