"use client";

interface SideBySideProps {
  without: string;
  withNora: string;
}

export default function SideBySide({ without, withNora }: SideBySideProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Side-by-Side Comparison
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Without Nora */}
        <div className="rounded-lg border border-red-900/60 bg-[#1a1a1a] overflow-hidden animate-slide-up">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-950/40 border-b border-red-900/40">
            <svg className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-semibold text-red-300">Without Nora</span>
            <span className="ml-auto text-xs text-red-500 bg-red-950/60 px-2 py-0.5 rounded-full">
              Privacy exposed
            </span>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-300 leading-relaxed">{without}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400/80">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              Sensitive data used in response
            </div>
          </div>
        </div>

        {/* With Nora */}
        <div className="rounded-lg border border-green-900/60 bg-[#1a1a1a] overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-green-950/30 border-b border-green-900/40">
            <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-semibold text-green-300">With Nora</span>
            <span className="ml-auto text-xs text-green-500 bg-green-950/60 px-2 py-0.5 rounded-full">
              Privacy protected
            </span>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-300 leading-relaxed">{withNora}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-green-400/80">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Only minimum necessary data shared
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
