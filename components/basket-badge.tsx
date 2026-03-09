"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useBasket } from "@/lib/basket-context"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function BasketBadge() {
  const pathname = usePathname()
  const { count } = useBasket()
  return (
    <Link
      href="/basket"
      className={cn(
        "text-sm transition-colors hover:text-foreground",
        pathname === "/basket" ? "font-medium text-foreground" : "text-muted-foreground"
      )}
    >
      Basket
      {count > 0 && (
        <Badge className="ml-1.5" variant="secondary">
          {count}
        </Badge>
      )}
    </Link>
  )
}
