const STORAGE_KEY = "t2_schedule_alliances";

export const DEFAULT_ALLIANCES = ["Альянс Центр", "Альянс Север", "Альянс Юг"];

function sortAlliances(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right, "ru"));
}

export function loadStoredAlliances() {
  if (typeof window === "undefined") return DEFAULT_ALLIANCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ALLIANCES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ALLIANCES;
    return sortAlliances([...DEFAULT_ALLIANCES, ...parsed.map((item) => String(item))]);
  } catch {
    return DEFAULT_ALLIANCES;
  }
}

export function saveStoredAlliances(alliances: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortAlliances(alliances)));
}

export function mergeAllianceOptions(...groups: Array<Array<string | undefined>>) {
  return sortAlliances(groups.flat().filter((value): value is string => Boolean(value && value.trim())));
}
