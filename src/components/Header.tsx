"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="bg-gray-800 text-white">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            NovelNest
          </Link>
          <Link
            href="/novels"
            className={pathname === "/novels" ? "text-blue-400" : ""}
          >
            Browse
          </Link>
          {session && (
            <>
              <Link
                href="/my-works"
                className={pathname === "/my-works" ? "text-blue-400" : ""}
              >
                My Works
              </Link>
              <Link
                href="/profile"
                className={pathname === "/profile" ? "text-blue-400" : ""}
              >
                Profile
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {status === 'loading' ? (
            <span>Loading...</span>
          ) : session ? (
            <>
              <span>Welcome, {session.user?.name}</span>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
