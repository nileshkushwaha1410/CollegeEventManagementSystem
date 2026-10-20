const ANNOUNCEMENTS_KEY = "collegeAnnouncements";

export function getAnnouncements() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(ANNOUNCEMENTS_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Could not read announcements:", error);
    return [];
  }
}

export function saveAnnouncements(announcements) {
  localStorage.setItem(
    ANNOUNCEMENTS_KEY,
    JSON.stringify(announcements)
  );
}