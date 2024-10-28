"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("userToken");
      setIsLoggedIn(!!token);
      if (token) {
        fetchUserName(token);
      } else {
        setUserName("");
      }
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, [pathname]);

  const fetchUserName = async (token: string) => {
    try {
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserName(data.name);
      } else {
        console.error("Failed to fetch user name:", await response.text());
      }
    } catch (error) {
      console.error("Failed to fetch user name:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setIsLoggedIn(false);
    setUserName("");
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          NovelNest
        </Link>
        <div className="space-x-4 flex items-center">
          <Link href="/novels" className="text-gray-600 hover:text-gray-800">
            Browse
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/novels/publish"
                className="text-gray-600 hover:text-gray-800"
              >
                Publish
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-gray-800"
              >
                Profile
              </Link>
              <span className="text-gray-600">
                Welcome, {userName || "User"}
              </span>
              <Button onClick={handleLogout} variant="ghost">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="text-gray-600 hover:text-gray-800"
              >
                Register
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-800">
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
