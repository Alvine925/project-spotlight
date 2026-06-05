import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteNav() {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ff6600]">
            <span className="text-[10px] font-black text-white">PA</span>
          </div>
          <span className="font-display text-base font-bold text-gray-900">
            Project<span className="text-[#ff6600]">Atlas</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link
            to="/"
            className={`transition-colors hover:text-gray-900 ${path === "/" ? "font-medium text-gray-900" : "text-gray-500"}`}
          >
            Discover
          </Link>
          <Link
            to="/submit"
            className={`transition-colors hover:text-gray-900 ${path === "/submit" ? "font-medium text-gray-900" : "text-gray-500"}`}
          >
            Submit
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`transition-colors hover:text-gray-900 ${path.startsWith("/dashboard") ? "font-medium text-gray-900" : "text-gray-500"}`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden text-sm text-gray-500 hover:text-gray-900 md:inline"
              >
                {user.email?.split("@")[0]}
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="rounded-full border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-full bg-[#ff6600] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e55a00]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
