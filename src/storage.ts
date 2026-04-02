export interface TodoItem {
  readonly id: string;
  readonly text: string;
  readonly done: boolean;
}

export interface AppData {
  readonly todos: readonly TodoItem[];
  readonly markdown: string;
}

const STORAGE_KEY = "tabdraft";

const defaultData: AppData = {
  todos: [],
  markdown: "",
};

function getStorage(): chrome.storage.SyncStorageArea | null {
  if (typeof chrome !== "undefined" && chrome.storage?.sync) {
    return chrome.storage.sync;
  }
  return null;
}

export async function loadData(): Promise<AppData> {
  const storage = getStorage();
  if (storage) {
    const result = await storage.get(STORAGE_KEY);
    return (result[STORAGE_KEY] as AppData | undefined) ?? defaultData;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : defaultData;
}

export async function saveData(data: AppData): Promise<void> {
  const storage = getStorage();
  if (storage) {
    await storage.set({ [STORAGE_KEY]: data });
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedSave(data: AppData, delayMs = 400): void {
  if (saveTimer !== null) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    saveData(data);
    saveTimer = null;
  }, delayMs);
}
