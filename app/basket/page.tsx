import { BasketContent } from "@/components/basket-content";

export const metadata = {
  title: "Basket — Khalsa Community Pitch Project",
};

export default function BasketPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Your Basket</h1>
      <BasketContent />
    </div>
  );
}
