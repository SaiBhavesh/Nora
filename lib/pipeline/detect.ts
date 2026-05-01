import type { DataCategory, SensitiveItem } from "@/lib/types";

/**
 * Output of the deterministic detection layer. Carries the same shape as the
 * over-the-wire `SensitiveItem` plus internal provenance fields the API routes
 * use for de-duplication and confidence scoring.
 */
export interface DetectedSignal extends SensitiveItem {
  source: "detector";
  detector: string;
  confidence: number;
}

const STREET_SUFFIXES = [
  "St", "Street", "Ave", "Avenue", "Blvd", "Boulevard",
  "Rd", "Road", "Dr", "Drive", "Ln", "Lane", "Ct", "Court",
  "Pl", "Place", "Way", "Terrace", "Ter", "Pkwy", "Parkway",
  "Cir", "Circle", "Hwy", "Highway", "Sq", "Square",
  "Trl", "Trail", "Plz", "Plaza", "Aly", "Alley",
  "Fwy", "Freeway", "Rte", "Route",
];

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
const SSN_RE = /\b(?!000|666|9\d\d)\d{3}[- ](?!00)\d{2}[- ](?!0000)\d{4}\b/g;
const ZIP_RE = /\b\d{5}(?:-\d{4})?\b/g;
const COORD_RE = /-?\d{1,3}\.\d{4,}\s*[,°]?\s*-?\d{1,3}\.\d{4,}/g;
const CC_RE = /\b(?:\d[ -]?){13,19}\b/g;
const ADDRESS_RE = new RegExp(
  `\\b\\d{1,5}\\s+(?:[A-Z][\\w'.\\-]*\\s+){1,5}(?:${STREET_SUFFIXES.join("|")})\\b\\.?`,
  "g"
);
const IP_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const DOB_RE = /\b(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b/g;

function luhn(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function makeSignal(
  text: string,
  category: DataCategory,
  risk: "high" | "medium" | "low",
  reasoning: string,
  alternative: string,
  detector: string,
  confidence = 1
): DetectedSignal {
  return {
    text,
    type: category,
    risk,
    reasoning,
    alternative,
    source: "detector",
    detector,
    confidence,
  };
}

function dedupeByText<T extends { text: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const k = it.text.trim().toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

/**
 * Run all deterministic detectors against the input message and return a
 * de-duplicated list of `DetectedSignal`s. Never throws; always cheap.
 */
export function detectDeterministic(message: string): DetectedSignal[] {
  if (!message || message.length === 0) return [];
  const out: DetectedSignal[] = [];

  for (const m of message.matchAll(ADDRESS_RE)) {
    out.push(
      makeSignal(
        m[0],
        "address",
        "high",
        "Exact street addresses enable physical-world targeting and stalking risk.",
        "your area",
        "address"
      )
    );
  }

  for (const m of message.matchAll(EMAIL_RE)) {
    out.push(
      makeSignal(
        m[0],
        "behavioral",
        "high",
        "Personal email addresses uniquely identify you and enable cross-site tracking.",
        "your email",
        "email"
      )
    );
  }

  for (const m of message.matchAll(PHONE_RE)) {
    out.push(
      makeSignal(
        m[0],
        "behavioral",
        "high",
        "Phone numbers are direct contact identifiers and high-value targets for fraud.",
        "a contact number",
        "phone"
      )
    );
  }

  for (const m of message.matchAll(SSN_RE)) {
    out.push(
      makeSignal(
        m[0],
        "financial",
        "high",
        "Social Security Numbers enable identity theft, fraudulent credit, and tax fraud.",
        "an identifier (last 4)",
        "ssn"
      )
    );
  }

  for (const m of message.matchAll(COORD_RE)) {
    out.push(
      makeSignal(
        m[0],
        "address",
        "high",
        "Precise GPS coordinates pinpoint your location to within a few meters.",
        "approximate location",
        "coordinates"
      )
    );
  }

  for (const m of message.matchAll(CC_RE)) {
    if (!luhn(m[0])) continue;
    out.push(
      makeSignal(
        m[0],
        "financial",
        "high",
        "Credit card numbers expose direct payment authority.",
        "a payment method on file",
        "credit_card"
      )
    );
  }

  // ZIP — added after address so we can drop ones already inside an address match.
  for (const m of message.matchAll(ZIP_RE)) {
    if (out.some((s) => s.text.includes(m[0]))) continue;
    out.push(
      makeSignal(
        m[0],
        "address",
        "medium",
        "ZIP codes narrow your location to a small area.",
        "your area",
        "zip"
      )
    );
  }

  for (const m of message.matchAll(IP_RE)) {
    const parts = m[0].split(".").map((s) => parseInt(s, 10));
    if (parts.some((p) => Number.isNaN(p) || p > 255)) continue;
    out.push(
      makeSignal(
        m[0],
        "behavioral",
        "medium",
        "IP addresses link a device or network to specific actions.",
        "your network",
        "ip"
      )
    );
  }

  for (const m of message.matchAll(DOB_RE)) {
    out.push(
      makeSignal(
        m[0],
        "behavioral",
        "medium",
        "Full dates of birth are a key identity verification field.",
        "your birth year",
        "dob"
      )
    );
  }

  return dedupeByText(out);
}

/**
 * Strip the internal provenance fields so a `DetectedSignal` can be returned
 * over the wire as a plain `SensitiveItem`.
 */
export function toSensitiveItem(s: DetectedSignal): SensitiveItem {
  return {
    text: s.text,
    type: s.type,
    risk: s.risk,
    reasoning: s.reasoning,
    alternative: s.alternative,
  };
}

/**
 * Fallback rewriter: replace each detected text with its `alternative`. Used
 * when the LLM is unavailable so the demo still produces a privacy-safe rewrite
 * of obvious identifiers.
 *
 * Sorts by length-desc so longer matches (e.g. a full address) are substituted
 * before any of their substrings (e.g. the trailing ZIP).
 */
export function applyMinimization(message: string, signals: SensitiveItem[]): string {
  if (signals.length === 0) return message;
  let out = message;
  const sorted = [...signals].sort((a, b) => b.text.length - a.text.length);
  for (const s of sorted) {
    if (!s.alternative || !s.text) continue;
    out = out.split(s.text).join(s.alternative);
  }
  return out;
}
