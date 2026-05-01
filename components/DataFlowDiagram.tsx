"use client";

import { SensitiveItem } from "@/lib/types";

interface DataFlowDiagramProps {
  detected: SensitiveItem[];
  protected_count: number;
}

export default function DataFlowDiagram({ detected, protected_count }: DataFlowDiagramProps) {
  const allowed = detected.length - protected_count;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Data Flow</span>
        <span className="text-xs text-gray-600">— what moved where</span>
      </div>

      <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Your message */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-14 h-14 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 text-center leading-tight">Your<br/>Message</p>
            {detected.length > 0 && (
              <span className="text-xs text-red-400 font-semibold">{detected.length} signals</span>
            )}
          </div>

          {/* Arrow */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-[40px]">
            <div className="flex items-center gap-1 w-full">
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <svg className="h-3 w-3 text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 4l8 8-8 8" />
              </svg>
            </div>
            <span className="text-xs text-gray-700">raw</span>
          </div>

          {/* Nora Filter */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-16 h-16 rounded-xl border-2 border-purple-700/60 bg-purple-950/30 flex items-center justify-center relative">
              <svg className="h-7 w-7 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {protected_count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {protected_count}
                </span>
              )}
            </div>
            <p className="text-xs text-purple-300 font-semibold text-center leading-tight">Nora<br/>Filter</p>
            {protected_count > 0 && (
              <span className="text-xs text-red-400">{protected_count} blocked</span>
            )}
          </div>

          {/* Arrow + blocked signals branching down */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-[40px]">
            <div className="flex items-center gap-1 w-full">
              <div className="flex-1 h-px bg-green-900/60" />
              <svg className="h-3 w-3 text-green-700 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 4l8 8-8 8" />
              </svg>
            </div>
            <span className="text-xs text-green-700">safe</span>
          </div>

          {/* AI Model */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-14 h-14 rounded-xl border border-green-900/50 bg-green-950/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-green-400 text-center leading-tight">AI<br/>Model</p>
            {allowed > 0 ? (
              <span className="text-xs text-orange-400">{allowed} allowed</span>
            ) : (
              <span className="text-xs text-green-500">min. data</span>
            )}
          </div>

          {/* Arrow */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-[40px]">
            <div className="flex items-center gap-1 w-full">
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <svg className="h-3 w-3 text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 4l8 8-8 8" />
              </svg>
            </div>
            <span className="text-xs text-gray-700">response</span>
          </div>

          {/* You */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-14 h-14 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 text-center leading-tight">Your<br/>Response</p>
            <span className="text-xs text-gray-600">private</span>
          </div>
        </div>

        {/* Blocked signals legend */}
        {detected.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
            <p className="text-xs text-gray-600 mb-2">Signals intercepted at Nora filter:</p>
            <div className="flex flex-wrap gap-1.5">
              {detected.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-red-900/40 bg-red-950/20 text-red-400"
                >
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  {item.type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
