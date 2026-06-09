import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteNav() {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [path]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
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
          <Link to="/dashboard" search={{ add: "1" }} className="transition-colors hover:text-gray-900">
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
                className="hidden rounded-full border border-gray-200 p-2 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900 md:inline-flex"
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
                className="hidden rounded-full bg-[#ff6600] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00] md:inline-flex"
              >
                Create your page
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <nav className="flex flex-col px-4 py-3 text-sm">
            <Link to="/" className="rounded-md px-3 py-2.5 text-gray-700 hover:bg-gray-50">Discover</Link>
            <a href="/#features" className="rounded-md px-3 py-2.5 text-gray-700 hover:bg-gray-50">Features</a>
            <a href="/#examples" className="rounded-md px-3 py-2.5 text-gray-700 hover:bg-gray-50">Examples</a>
            <Link to="/dashboard" search={{ add: "1" }} className="rounded-md px-3 py-2.5 text-gray-700 hover:bg-gray-50">Add Work</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="rounded-md px-3 py-2.5 text-gray-700 hover:bg-gray-50">Dashboard</Link>
                <button
                  onClick={() => { setOpen(false); supabase.auth.signOut(); }}
                  className="mt-1 flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3">
                <Link to="/auth" className="rounded-md px-3 py-2.5 text-gray-700 hover:bg-gray-50">Sign in</Link>
                <Link to="/auth" className="rounded-full bg-[#ff6600] px-4 py-2.5 text-center font-semibold text-white hover:bg-[#e55a00]">
                  Create your page
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
