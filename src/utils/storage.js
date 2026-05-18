import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'joacademy_forms';

export function getForms() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveForms(forms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
}

export function getFormBySlug(slug) {
  return getForms().find((f) => f.slug === slug);
}

export function createForm(data) {
  const forms = getForms();
  const form = {
    id: uuidv4(),
    slug: data.slug || slugify(data.name),
    ...data,
    fields: data.fields || [],
    createdAt: new Date().toISOString(),
    submissionsCount: 0,
  };
  forms.push(form);
  saveForms(forms);
  return form;
}

export function updateForm(id, data) {
  const forms = getForms();
  const idx = forms.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  forms[idx] = { ...forms[idx], ...data, id };
  saveForms(forms);
  return forms[idx];
}

export function deleteForm(id) {
  saveForms(getForms().filter((f) => f.id !== id));
}

export function incrementSubmissions(id) {
  const forms = getForms();
  const idx = forms.findIndex((f) => f.id === id);
  if (idx !== -1) {
    forms[idx].submissionsCount = (forms[idx].submissionsCount || 0) + 1;
    saveForms(forms);
  }
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0621-\u064a-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 60) || uuidv4().slice(0, 8);
}

export function makeUniqueSlug(slug, excludeId) {
  const forms = getForms().filter((f) => f.id !== excludeId);
  let candidate = slug;
  let i = 2;
  while (forms.some((f) => f.slug === candidate)) {
    candidate = `${slug}-${i++}`;
  }
  return candidate;
}
