import { Timestamp } from "firebase/firestore";
import type { GovernmentForm } from "@/types/governmentForms";

const STORAGE_KEY = "mitra_smart_scraped_forms";

type PublisherInfo = {
  userId: string;
  name: string;
  email: string | null;
};

const readFormsFromStorage = (): GovernmentForm[] => {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as GovernmentForm[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeFormsToStorage = (forms: GovernmentForm[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
};

export const getScrapedForms = (): GovernmentForm[] => {
  return readFormsFromStorage();
};

export const saveScrapedForm = (form: GovernmentForm): GovernmentForm => {
  const forms = readFormsFromStorage();
  const formId = form.id || `scraped-${Date.now()}`;
  const now = Timestamp.now();

  const normalized: GovernmentForm = {
    ...form,
    id: formId,
    createdAt: form.createdAt || now,
    updatedAt: now,
    isActive: typeof form.isActive === "boolean" ? form.isActive : true,
    isVerified: typeof form.isVerified === "boolean" ? form.isVerified : false,
    needsUpdate: typeof form.needsUpdate === "boolean" ? form.needsUpdate : false,
    published: typeof form.published === "boolean" ? form.published : false,
  };

  const filtered = forms.filter((item) => item.id !== formId);
  filtered.unshift(normalized);
  writeFormsToStorage(filtered);

  return normalized;
};

export const publishScrapedForm = (
  formId: string,
  publisher: PublisherInfo,
): GovernmentForm | null => {
  const forms = readFormsFromStorage();
  const now = Timestamp.now();

  const updatedForms = forms.map((form) => {
    if (form.id !== formId) return form;

    return {
      ...form,
      published: true,
      publishedByUserId: publisher.userId,
      publishedByName: publisher.name,
      publishedByEmail: publisher.email || undefined,
      publishedAt: now,
      updatedAt: now,
    } satisfies GovernmentForm;
  });

  writeFormsToStorage(updatedForms);
  return updatedForms.find((form) => form.id === formId) || null;
};
