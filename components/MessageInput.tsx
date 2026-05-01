"use client";

const DEMO_MESSAGE =
  "I'm really anxious about midterms and I haven't been sleeping. Can you find me a therapist near my dorm at 915 Castle Point Terrace, Hoboken NJ?";

interface MessageInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function MessageInput({ value, onChange, onSubmit, loading }: MessageInputProps) {
  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!loading && value.trim()) onSubmit();
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Your Message
        </span>
        <button
          type="button"
          onClick={() => onChange(DEMO_MESSAGE)}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-900/20"
        >
          <span>✦</span>
          Try demo scenario
        </button>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          rows={4}
          placeholder="Type your request naturally… e.g. I'm stressed about midterms, find me a therapist near my dorm at 915 Castle Point Terrace, Hoboken NJ"
          className={`
            w-full rounded-lg border bg-[#1a1a1a] text-gray-100 placeholder-gray-600
            px-4 py-3 text-sm resize-none outline-none transition-all
            ${loading
              ? "opacity-50 cursor-not-allowed border-[#2a2a2a]"
              : "border-[#2a2a2a] focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30"
            }
          `}
        />
        <span className="absolute bottom-2 right-3 text-xs text-gray-700">
          Ctrl+Enter to send
        </span>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className={`
          mt-3 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg
          font-semibold text-sm transition-all duration-200
          ${loading || !value.trim()
            ? "bg-purple-900/30 text-purple-600 cursor-not-allowed"
            : "bg-purple-700 hover:bg-purple-600 text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 active:scale-[0.99]"
          }
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Analyzing…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Intercept & Protect
          </>
        )}
      </button>
    </div>
  );
}
