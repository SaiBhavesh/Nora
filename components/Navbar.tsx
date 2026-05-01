"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PersonaProfile } from "@/lib/types";

interface NavbarProps {
  profile: PersonaProfile | null;
  onResetProfile: () => void;
}

const PERSONA_BADGE: Record<string, string> = {
  conservative: "bg-purple-900/40 text-purple-300 border-purple-800",
  balanced: "bg-blue-900/40 text-blue-300 border-blue-800",
  open: "bg-green-900/40 text-green-300 border-green-800",
};

export default function Navbar({ profile, onResetProfile }: NavbarProps) {
  const router = useRouter();

  function handleReset() {
    onResetProfile();
    router.push("/onboarding");
  }

  return (
    <div className="border-b border-[#1e1e1e] bg-[#0f0f0f]/90 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-md bg-purple-700 flex items-center justify-center">
            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">Nora</span>
            <span className="hidden sm:inline text-xs text-gray-600 ml-2">Privacy Governance</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Compare link */}
          <Link
            href="/compare"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-300 transition-colors px-2 py-1 rounded hover:bg-purple-900/10"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Compare
          </Link>

          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-gray-500">Intercepting</span>
          </div>

          {/* Profile pill */}
          {profile ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
                <div className="w-5 h-5 rounded-full bg-purple-700/60 flex items-center justify-center text-xs font-bold text-purple-200">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-300 font-medium">{profile.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded border capitalize ${PERSONA_BADGE[profile.persona]}`}>
                  {profile.persona}
                </span>
              </div>
              <button
                onClick={handleReset}
                title="Reset profile"
                className="p-1.5 rounded-md hover:bg-[#2a2a2a] text-gray-600 hover:text-gray-400 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              href="/onboarding"
              className="text-xs px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-medium transition-colors"
            >
              Set Up Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
