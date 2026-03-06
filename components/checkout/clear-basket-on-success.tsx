"use client";

import { useEffect } from "react";
import { useBasket } from "@/lib/basket-context";

export function ClearBasketOnSuccess() {
  const { clear } = useBasket();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
