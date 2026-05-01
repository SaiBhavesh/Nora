"use client";
import { useEffect, useState } from "react";
import { PersonaProfile } from "./types";

export function useProfile() {
  const [profile, setProfile] = useState<PersonaProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nora_profile");
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  function saveProfile(p: PersonaProfile) {
    localStorage.setItem("nora_profile", JSON.stringify(p));
    setProfile(p);
  }

  function clearProfile() {
    localStorage.removeItem("nora_profile");
    localStorage.removeItem("nora_history");
    setProfile(null);
  }

  return { profile, saveProfile, clearProfile, loaded };
}
