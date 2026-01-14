'use client';

import { Button } from "./ui/button";
import Link from "next/link";
import { LogOut, Menu, X, UserCircle, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Determine user type from role
  const isExpert = user?.role === "KNOWLEDGE_PROVIDER";
  const isSeeker = user?.role === "KNOWLEDGE_SEEKER";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          
          {/* LOGO */}
          <h1 className="text-2xl sm:text-3xl font-bold text-black/80">
            Answer human
            <span className="text-primary font-extrabold -ml-1 text-4xl">
              .
            </span>
          </h1>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-6">
            <ul className="flex items-center gap-6">
              {/* SEEKER NAVIGATION */}
              {(!isAuthenticated || isSeeker) && (
                <>
                  <li>
                    <Link 
                      href="/explore" 
                      className="hover:text-primary transition" 
                      style={{fontWeight: pathname === "/explore" ? "bold" : "normal"}}
                    >
                      Explore
                    </Link>
                  </li>
                  {isAuthenticated && (
                    <li className="flex items-center gap-2">
                      <Link 
                        href="/post" 
                        className="hover:text-primary transition" 
                        style={{fontWeight: pathname === "/post" ? "bold" : "normal"}}
                      >
                        Post a Question
                      </Link>
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-900 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-blue-900" />
                      </span>
                    </li>
                  )}
                  {isAuthenticated && (
                    <li>
                      <Link
                        href="/expert/onboarding"
                        className="hover:text-primary transition"
                        style={{fontWeight: pathname === "/expert/onboarding" ? "bold" : "normal"}}
                      >
                        Become an Expert
                      </Link>
                    </li>
                  )}
                </>
              )}

              {/* EXPERT NAVIGATION */}
              {isAuthenticated && isExpert && (
                <>
                  <li>
                    <Link 
                      href="/expert/feed" 
                      className="hover:text-primary transition" 
                      style={{fontWeight: pathname === "/expert/feed" ? "bold" : "normal"}}
                    >
                      Feed
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/expert/requests"
                      className="hover:text-primary transition"
                      style={{fontWeight: pathname === "/expert/requests" || pathname.startsWith("/expert/requests/") ? "bold" : "normal"}}
                    >
                      Requests
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/expert"
                      className="hover:text-primary transition flex items-center gap-1"
                      style={{fontWeight: pathname === "/expert" ? "bold" : "normal"}}
                    >
                      <LayoutDashboard size={16} />
                      Expert Dashboard
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {isAuthenticated ? (
              <>
                <Link href={isExpert ? "/expert/profile" : "/profile"}>
                  <Button 
                    variant={"ghost"} 
                    className="text-md flex items-center gap-2" 
                    style={{
                      backgroundColor: (isExpert ? pathname === "/expert/profile" : pathname === "/profile") ? "#f0f0f0" : "transparent"
                    }}
                  >
                    <UserCircle size={20} />
                    {user && (
                      <span className="text-sm text-gray-600">
                        {user.username}
                      </span>
                    )}
                  </Button>
                </Link>
                <Button variant="link" className="text-md text-red-400 hover:text-red-600" onClick={handleLogout}>
                  Sign out <LogOut size={16} />
                </Button>
              </>
            ) : (
              <>
                <Link href={`/login${pathname !== "/" ? `?redirect=${pathname}` : ""}`}>
                  <Button variant="link" className="text-md">
                    Sign in
                  </Button>
                </Link>
                <Link href={`/register${pathname !== "/" ? `?redirect=${pathname}` : ""}`}>
                  <Button variant="outline" className="border-primary">
                    Join
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="lg:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="lg:hidden mt-6 border-t pt-6 space-y-4">
            {/* SEEKER NAVIGATION */}
            {(!isAuthenticated || isSeeker) && (
              <>
                <Link href="/explore" className="block text-lg">
                  Explore
                </Link>
                {isAuthenticated && (
                  <Link href="/post" className="block text-lg">
                    Post a Question
                  </Link>
                )}
                {isAuthenticated && (
                  <Link href="/expert/onboarding" className="block text-lg">
                    Become an Expert
                  </Link>
                )}
              </>
            )}

            {/* EXPERT NAVIGATION */}
            {isAuthenticated && isExpert && (
              <>
                <Link href="/expert/feed" className="block text-lg">
                  Feed
                </Link>
                <Link href="/expert/requests" className="block text-lg">
                  Requests
                </Link>
                <Link href="/expert" className="block text-lg flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  Expert Dashboard
                </Link>
              </>
            )}

            <div className="flex gap-4 pt-4">
              {isAuthenticated ? (
                <>
                  <Link href={isExpert ? "/expert/profile" : "/profile"} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <UserCircle size={16} className="mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="link" onClick={handleLogout} className="flex-1">
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href={`/login${pathname !== "/" ? `?redirect=${pathname}` : ""}`}
                    className="flex-1"
                  >
                    <Button variant="link" className="w-full">Sign in</Button>
                  </Link>
                  <Link
                    href={`/register${pathname !== "/" ? `?redirect=${pathname}` : ""}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full border-primary">
                      Join
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
