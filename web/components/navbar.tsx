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
  const isExpertRoute = pathname.startsWith("/expert");
  const showExpertNav = isAuthenticated && isExpert && isExpertRoute;

  const isActive = (href: string) => {
    if (href === "/explore") return pathname.startsWith("/explore");
    if (href === "/post") return pathname.startsWith("/post");
    if (href === "/expert/onboarding") return pathname.startsWith("/expert/onboarding");
    if (href === "/expert/feed") return pathname.startsWith("/expert/feed");
    if (href === "/expert/requests") return pathname.startsWith("/expert/requests");
    if (href === "/expert") return pathname === "/expert";
    return pathname === href;
  };

  const seekerNavItems = [
    {
      href: "/explore",
      label: "Explore",
      show: true,
    },
    {
      href: "/post",
      label: (
        <span className="flex items-center gap-2">
          Post a Question
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-900 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-blue-900" />
          </span>
        </span>
      ),
      show: isAuthenticated,
    },
    {
      href: "/expert",
      label: (
        <span className="flex items-center gap-1">
          <LayoutDashboard size={16} />
          Expert Dashboard
        </span>
      ),
      show: isAuthenticated && isExpert,
    },
    {
      href: "/expert/onboarding",
      label: "Become an Expert",
      show: isAuthenticated && isSeeker,
    },
  ];

  const expertNavItems = [
    {
      href: "/expert/feed",
      label: "Feed",
      show: true,
    },
    {
      href: "/expert/requests",
      label: "Requests",
      show: true,
    },
    {
      href: "/expert",
      label: (
        <span className="flex items-center gap-1">
          <LayoutDashboard size={16} />
          Expert Dashboard
        </span>
      ),
      show: true,
    },
  ];

  const navItems = showExpertNav ? expertNavItems : seekerNavItems;

  const renderDesktopLinks = () =>
    navItems
      .filter((item) => item.show)
      .map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="hover:text-primary transition"
            style={{ fontWeight: isActive(item.href) ? "bold" : "normal" }}
          >
            {item.label}
          </Link>
        </li>
      ));

  const renderMobileLinks = () =>
    navItems
      .filter((item) => item.show)
      .map((item) => (
        <Link key={item.href} href={item.href} className="block text-lg">
          {item.label}
        </Link>
      ));

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
            <ul className="flex items-center gap-6">{renderDesktopLinks()}</ul>

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
            {renderMobileLinks()}

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
