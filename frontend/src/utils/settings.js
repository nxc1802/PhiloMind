export const STORAGE_KEY = "mln_web_settings";

export const DEFAULT_SETTINGS = {
  displayName: "Học viên",
  emailNotification: true,
  autoplayVideo: false,
  showTranscriptByDefault: true,
  studyReminderTime: "19:00",
  unlockAllLessons: true, // Default to true as requested
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
