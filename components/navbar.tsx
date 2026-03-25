import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, LogOut } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const { data: user, isLoading } = trpc.user.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (user && !user.onboarded && router.pathname !== "/onboarding") {
      router.push("/onboarding");
    }
  }, [user, router]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800/60 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/assets/images/logo.png"
            alt="Aptos logo"
            width={32}
            height={32}
            className="rounded-sm invert"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            Aptos
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-400 md:flex">
          <a href="#features" className="transition hover:text-[#E4FF30]">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-[#E4FF30]">
            How It Works
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-neutral-800" />
          ) : user ? (
            <>
              {user.picture && (
                <Image
                  src={user.picture}
                  alt={user.name ?? "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="hidden text-sm font-medium text-neutral-300 sm:inline">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                asChild
              >
                <a href="/auth/logout">
                  <LogOut className="size-4" />
                </a>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="default"
                className="text-neutral-300 hover:text-white hover:bg-neutral-800"
                asChild
              >
                <a href="/auth/login">Log in</a>
              </Button>
              <Button
                size="default"
                className="bg-[#E4FF30] text-neutral-900 font-semibold hover:bg-[#d4ef20] shadow-lg shadow-[#E4FF30]/20"
                asChild
              >
                <a href="/auth/login?screen_hint=signup">
                  Get Started <ArrowRight className="ml-1 size-3.5" />
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
