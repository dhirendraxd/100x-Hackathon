import type { GovernmentForm } from "@/types/governmentForms";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface GuidedFieldAssist {
  placeholder?: string;
  hint?: string;
  example?: string;
}

export interface GuidedAssist {
  model: string;
  generatedAt: number;
  fields: Record<string, GuidedFieldAssist>;
}

// Strict, non-hallucinatory guidance: derives only from existing field metadata.
// Never invents new fields, options, or specific example values.
export function generateGuidedFormAssist(form: GovernmentForm): GuidedAssist {
  const fields: Record<string, GuidedFieldAssist> = {};

  for (const f of form.originalFields || []) {
    const assist: GuidedFieldAssist = {};
    // Generic, metadata-only placeholders and hints
    const baseLabel = f.label?.trim();
    // Only set very generic placeholders. No concrete sample values.
    if (f.type === "text" || f.type === "email" || f.type === "phone" || f.type === "number" || f.type === "address") {
      assist.placeholder = baseLabel ? `Enter ${baseLabel}` : undefined;
    }
    if (f.type === "select" || f.type === "radio") {
      // Do not add or alter options; just a neutral hint.
      assist.hint = "Select one of the provided options.";
    }
    if (f.type === "checkbox") {
      assist.hint = baseLabel ? `Check if "${baseLabel}" applies.` : "Check if this applies.";
    }
    if (f.type === "date") {
      assist.hint = "Choose the appropriate date.";
    }
    // Never provide example concrete values in strict mode
    assist.example = undefined;
    fields[f.id] = assist;
  }

  return {
    model: "mock-guidance-v1",
    generatedAt: Date.now(),
    fields,
  };
}

export function saveGuidedAssist(formId: string, assist: GuidedAssist) {
  try {
    localStorage.setItem(`ai_guided_form_${formId}`, JSON.stringify(assist));
  } catch (e) {
    console.error("Failed to save guided assist:", e);
  }
  // Also persist to Firestore when available
  try {
    const ref = doc(db, "ai_guidance", formId);
    setDoc(ref, assist, { merge: true }).catch(() => {});
  } catch (e) {
    // Ignore Firestore errors in mock mode
  }
}

export function loadGuidedAssist(formId: string): GuidedAssist | null {
  try {
    const raw = localStorage.getItem(`ai_guided_form_${formId}`);
    return raw ? (JSON.parse(raw) as GuidedAssist) : null;
  } catch (e) {
    console.error("Failed to load guided assist:", e);
    // Try Firestore as fallback
    try {
      const ref = doc(db, "ai_guidance", formId);
      // Note: synchronous function; we can't await here without changing signature.
      // We keep localStorage primary. Caller will usually save before load in the same flow.
    } catch (_) {
      // Firestore not available or offline; ignore
    }
    return null;
  }
}
