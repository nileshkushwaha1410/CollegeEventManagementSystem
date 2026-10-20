
const ATTENDANCE_KEY = "eventAttendance";

// Read saved attendance records safely
export function getAttendanceRecords() {
  try {
    const saved = localStorage.getItem(ATTENDANCE_KEY);
    const records = saved ? JSON.parse(saved) : [];

    return Array.isArray(records) ? records : [];
  } catch (error) {
    console.error("Could not load attendance:", error);
    return [];
  }
}

// Mark a student present for an event
export function markAttendance(eventId, student) {
  if (!eventId || !student?.id) {
    return {
      success: false,
      message: "Event or student information is missing.",
    };
  }

  const records = getAttendanceRecords();

  // Prevent duplicate attendance for this event and student
  const alreadyMarked = records.some(
    (record) =>
      String(record.eventId) === String(eventId) &&
      String(record.studentId) === String(student.id)
  );

  if (alreadyMarked) {
    return {
      success: false,
      message: "Attendance has already been recorded.",
    };
  }

  const newRecord = {
    id: `attendance-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    eventId: String(eventId),
    studentId: String(student.id),
    studentName: student.name || "Student",
    studentEmail: student.email || "",
    attendedAt: new Date().toISOString(),
    status: "Present",
  };

  try {
    localStorage.setItem(
      ATTENDANCE_KEY,
      JSON.stringify([...records, newRecord])
    );

    return {
      success: true,
      message: "Attendance recorded successfully!",
      record: newRecord,
    };
  } catch (error) {
    console.error("Could not save attendance:", error);

    return {
      success: false,
      message: "Could not save attendance. Please try again.",
    };
  }
}

// Get attendance for one event
export function getEventAttendance(eventId) {
  return getAttendanceRecords().filter(
    (record) => String(record.eventId) === String(eventId)
  );
}
