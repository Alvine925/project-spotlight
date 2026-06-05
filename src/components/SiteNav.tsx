import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteNav() {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ff6600]">
            <span className="text-[10px] font-black text-white">PA</span>
          </div>
          <span className="font-display text-lg font-bold text-gray-900">
            Project<span className="text-[#ff6600]">Atlas</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-gray-500 md:flex">
          <Link to="/" className={`transition-colors hover:text-gray-900 ${path === "/" ? "text-gray-900 font-medium" : ""}`}>
            Discover
          </Link>
          <a href="/#features" className="transition-colors hover:text-gray-900">Features</a>
          <a href="/#examples" className="transition-colors hover:text-gray-900">Examples</a>
          <Link to="/submit" className={`transition-colors hover:text-gray-900 ${path === "/submit" ? "text-gray-900 font-medium" : ""}`}>
            Add Work
          </Link>
          {user && (
            <Link to="/dashboard" className={`transition-colors hover:text-gray-900 ${path.startsWith("/dashboard") ? "text-gray-900 font-medium" : ""}`}>
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 md:inline-flex"
              >
                {user.email?.split("@")[0]}
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="rounded-full border border-gray-200 p-2 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden text-sm text-gray-500 transition-colors hover:text-gray-900 md:inline"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="rounded-full bg-[#ff6600] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00]"
              >
                Create your page
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
