"use client";

import { Persona } from "@/lib/types";

interface PersonaSliderProps {
  persona: Persona;
  onChange: (p: Persona) => void;
}

const personas: { id: Persona; label: string; description: string; color: string; activeClass: string }[] = [
  {
    id: "conservative",
    label: "Conservative",
    description: "Block everything sensitive",
    color: "#7c3aed",
    activeClass: "bg-purple-700 border-purple-500 text-white shadow-lg shadow-purple-900/40",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Block clearly sensitive data",
    color: "#3b82f6",
    activeClass: "bg-blue-700 border-blue-500 text-white shadow-lg shadow-blue-900/40",
  },
  {
    id: "open",
    label: "Open",
    description: "Block only dangerous data",
    color: "#22c55e",
    activeClass: "bg-green-700 border-green-500 text-white shadow-lg shadow-green-900/40",
  },
];

export default function PersonaSlider({ persona, onChange }: PersonaSliderProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Privacy Persona
        </span>
        <span className="text-xs text-gray-600">— controls what Nora blocks</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`
              relative flex flex-col items-start px-4 py-3 rounded-lg border transition-all duration-200
              ${persona === p.id
                ? p.activeClass
                : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-gray-600 hover:text-gray-200"
              }
            `}
          >
            {persona === p.id && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/60" />
            )}
            <span className="text-sm font-semibold">{p.label}</span>
            <span className="text-xs opacity-70 mt-0.5 leading-tight">{p.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
