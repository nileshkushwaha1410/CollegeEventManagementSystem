
const READ_STATUS_KEY = "collegeNotificationReadStatus";

function getSavedStatus() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(READ_STATUS_KEY) || "{}"
    );

    return saved && typeof saved === "object" && !Array.isArray(saved)
      ? saved
      : {};
  } catch (error) {
    console.error("Could not read notification status:", error);
    return {};
  }
}

function getStudentKey(studentId) {
  return String(studentId);
}

export function getReadAnnouncementIds(studentId) {
  if (studentId === undefined || studentId === null) {
    return [];
  }

  const allStatus = getSavedStatus();
  const studentStatus = allStatus[getStudentKey(studentId)];

  return Array.isArray(studentStatus) ? studentStatus : [];
}

export function markAnnouncementAsRead(studentId, announcementId) {
  if (
    studentId === undefined ||
    studentId === null ||
    announcementId === undefined ||
    announcementId === null
  ) {
    return;
  }

  const allStatus = getSavedStatus();
  const studentKey = getStudentKey(studentId);
  const currentIds = Array.isArray(allStatus[studentKey])
    ? allStatus[studentKey]
    : [];

  if (!currentIds.includes(announcementId)) {
    allStatus[studentKey] = [...currentIds, announcementId];

    localStorage.setItem(
      READ_STATUS_KEY,
      JSON.stringify(allStatus)
    );
  }
}


export function getUnreadAnnouncementCount(studentId, announcements = []) {
  if (studentId === undefined || studentId === null) {
    return 0;
  }

  const readIds = getReadAnnouncementIds(studentId);

  return announcements.filter(
    (announcement) => !readIds.some(
      (id) => String(id) === String(announcement.id)
    )
  ).length;
}

