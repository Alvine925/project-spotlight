import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow transition-smooth group-hover:scale-110">
            <Compass className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Project<span className="text-gradient">Atlas</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/" className="transition-smooth hover:text-foreground">Discover</Link>
          <Link to="/submit" className="transition-smooth hover:text-foreground">Submit</Link>
          <a href="#how" className="transition-smooth hover:text-foreground">How it works</a>
        </nav>
        <Link
          to="/submit"
          className="rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:scale-105"
        >
          Add project
        </Link>
      </div>
    </header>
  );
}
