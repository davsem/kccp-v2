import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-background">
      <Separator />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Khalsa Hockey Club</span>
        <div className="flex gap-4">
          <span>About</span>
          <span>Contact</span>
          <span>Privacy</span>
        </div>
      </div>
    </footer>
  );
}
