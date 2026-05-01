import { DataCategory } from "./types";

export type RiskLevel = "low" | "medium" | "high";

export interface ThirdPartyService {
  name: string;
  category: string;
  riskLevel: RiskLevel;
  dataShared: DataCategory[];
  retention: string;
  notes?: string;
  logo?: string;
}

export const THIRD_PARTY_REGISTRY: Record<string, ThirdPartyService> = {
  uber: {
    name: "Uber",
    category: "Ride-sharing",
    riskLevel: "high",
    dataShared: ["address", "behavioral", "financial"],
    retention: "2 years",
    notes: "Shares trip history with advertisers. Location data sold to data brokers.",
  },
  lyft: {
    name: "Lyft",
    category: "Ride-sharing",
    riskLevel: "high",
    dataShared: ["address", "behavioral", "financial"],
    retention: "2 years",
    notes: "Location + ride patterns shared with third-party analytics.",
  },
  campus_shuttle: {
    name: "Campus Shuttle",
    category: "Transportation",
    riskLevel: "low",
    dataShared: ["address"],
    retention: "Session only",
    notes: "Institutional service. No third-party data sharing.",
  },
  google_maps: {
    name: "Google Maps",
    category: "Navigation",
    riskLevel: "medium",
    dataShared: ["address", "behavioral"],
    retention: "18 months (signed-in users)",
    notes: "Location history used for ad targeting when signed in.",
  },
  apple_maps: {
    name: "Apple Maps",
    category: "Navigation",
    riskLevel: "low",
    dataShared: ["address"],
    retention: "Not stored on Apple servers",
    notes: "Privacy-first navigation. Fuzzy location sent to servers.",
  },
  campus_health_portal: {
    name: "Campus Health Portal",
    category: "Healthcare",
    riskLevel: "low",
    dataShared: ["health", "academic"],
    retention: "HIPAA compliant, 7 years",
    notes: "Institutional, encrypted. FERPA + HIPAA protected.",
  },
  zocdoc: {
    name: "ZocDoc",
    category: "Healthcare booking",
    riskLevel: "high",
    dataShared: ["health", "financial", "behavioral"],
    retention: "Indefinite",
    notes: "Shares appointment data with insurance companies and health data brokers.",
  },
  stripe: {
    name: "Stripe",
    category: "Payments",
    riskLevel: "low",
    dataShared: ["financial"],
    retention: "Tokenized, encrypted",
    notes: "PCI-DSS compliant. No raw card data stored.",
  },
  paypal: {
    name: "PayPal",
    category: "Payments",
    riskLevel: "medium",
    dataShared: ["financial", "behavioral"],
    retention: "10 years",
    notes: "Sells anonymized transaction patterns to advertisers.",
  },
  doordash: {
    name: "DoorDash",
    category: "Food delivery",
    riskLevel: "high",
    dataShared: ["address", "behavioral", "financial"],
    retention: "2 years",
    notes: "Precise home location sold to data brokers. Order patterns profiled.",
  },
  campus_dining: {
    name: "Campus Dining",
    category: "Food",
    riskLevel: "low",
    dataShared: ["financial"],
    retention: "Semester",
    notes: "Institutional meal plan system. No third-party sharing.",
  },
  amazon: {
    name: "Amazon",
    category: "E-commerce",
    riskLevel: "high",
    dataShared: ["address", "behavioral", "financial"],
    retention: "Indefinite",
    notes: "Extensive behavioral profiling. Purchase data sold to AWS advertisers.",
  },
  campus_registrar: {
    name: "Campus Registrar",
    category: "Academic",
    riskLevel: "low",
    dataShared: ["academic"],
    retention: "FERPA protected",
    notes: "Institutional. FERPA-compliant access controls.",
  },
  indeed: {
    name: "Indeed",
    category: "Job search",
    riskLevel: "high",
    dataShared: ["behavioral", "academic", "address"],
    retention: "Indefinite",
    notes: "Resume data and job search patterns sold to recruiters and data brokers.",
  },
  campus_careers: {
    name: "Campus Career Portal",
    category: "Job search",
    riskLevel: "low",
    dataShared: ["academic"],
    retention: "Graduation + 2 years",
    notes: "Institutional. Data shared only with verified campus employers.",
  },
  betterhelp: {
    name: "BetterHelp",
    category: "Mental health",
    riskLevel: "high",
    dataShared: ["health", "emotional", "financial"],
    retention: "Indefinite",
    notes: "Disclosed sharing mental health data with Facebook for targeting.",
  },
  campus_counseling: {
    name: "Campus Counseling Center",
    category: "Mental health",
    riskLevel: "low",
    dataShared: ["health", "emotional"],
    retention: "HIPAA compliant",
    notes: "Confidential institutional service. Cannot be shared without consent.",
  },
  none: {
    name: "Internal / No external service",
    category: "Internal",
    riskLevel: "low",
    dataShared: [],
    retention: "Session only",
  },
};

// Fallback alternatives when a service is blocked
export const SERVICE_ALTERNATIVES: Record<string, string> = {
  uber: "campus_shuttle",
  lyft: "campus_shuttle",
  google_maps: "apple_maps",
  doordash: "campus_dining",
  paypal: "stripe",
  zocdoc: "campus_health_portal",
  betterhelp: "campus_counseling",
  indeed: "campus_careers",
  amazon: "none",
};

export function getServiceRisk(serviceKey: string): ThirdPartyService {
  return THIRD_PARTY_REGISTRY[serviceKey] ?? THIRD_PARTY_REGISTRY["none"];
}

export function isServiceBlocked(serviceKey: string, persona: string): boolean {
  const service = getServiceRisk(serviceKey);
  if (persona === "conservative") return service.riskLevel === "high" || service.riskLevel === "medium";
  if (persona === "balanced") return service.riskLevel === "high";
  return false;
}
