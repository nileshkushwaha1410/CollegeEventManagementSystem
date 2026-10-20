
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAnnouncements } from "../utils/announcements";
import {
  getReadAnnouncementIds,
  markAnnouncementAsRead,
} from "../utils/notificationReadStatus";
import "./StudentNotifications.css";

function StudentNotifications() {
  const [announcements, setAnnouncements] = useState([]);
  const [readIds, setReadIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let user = null;

    try {
      user = JSON.parse(
        localStorage.getItem("currentUser") || "null"
      );
    } catch (error) {
      console.error("Could not read current user:", error);
    }

    setCurrentUser(user);
    setAnnouncements(getAnnouncements());

    if (user?.id !== undefined && user?.id !== null) {
      setReadIds(getReadAnnouncementIds(user.id));
    }
  }, []);

  function handleMarkAsRead(announcementId) {
    if (!currentUser?.id) {
      return;
    }

    try {
      markAnnouncementAsRead(currentUser.id, announcementId);

      setReadIds((previousIds) =>
        previousIds.includes(announcementId)
          ? previousIds
          : [...previousIds, announcementId]
      );
    } catch (error) {
      console.error("Could not update read status:", error);
    }
  }

  function handleMarkAllAsRead() {
  if (currentUser?.id === undefined || currentUser?.id === null) {
    return;
  }

  try {
    announcements.forEach((item) => {
      markAnnouncementAsRead(currentUser.id, item.id);
    });

    setReadIds((previousIds) => [
      ...new Set([
        ...previousIds,
        ...announcements.map((item) => item.id),
      ]),
    ]);
  } catch (error) {
    console.error("Could not mark all announcements as read:", error);
  }
}

  const unreadCount = announcements.filter(
    (item) => !readIds.includes(item.id)
  ).length;

  return (
    <main className="student-notifications-page">
      <header className="notifications-header">
        <p>STUDENT PORTAL</p>
        <h1>Notifications & Announcements</h1>
        <p>
          Stay updated with important college notices and event updates.
        </p>
      </header>

      <section className="notifications-list">
        <div className="notifications-summary">
  <h2>Latest Announcements</h2>

  <div className="notifications-summary-actions">
    <span className="unread-count">
      {unreadCount} unread
    </span>

    {unreadCount > 0 && (
      <button
        type="button"
        className="mark-all-read-button"
        onClick={handleMarkAllAsRead}
      >
        Mark All as Read
      </button>
    )}
  </div>
</div>

        {announcements.length === 0 ? (
          <p>No announcements available right now.</p>
        ) : (
          announcements.map((item) => {
            const isRead = readIds.includes(item.id);

            return (
              <article
                className={`student-notification-card ${
                  isRead ? "is-read" : "is-unread"
                }`}
                key={item.id}
              >
                <div className="notification-status-row">
                  <span className="notification-category">
                    {item.category}
                  </span>

                  <span
                    className={`read-status ${
                      isRead ? "status-read" : "status-unread"
                    }`}
                  >
                    {isRead ? "Read" : "Unread"}
                  </span>
                </div>

                <h3>{item.title}</h3>

                <p>{item.message}</p>

                <small>
                  Published:{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "Date unavailable"}
                </small>

                {!isRead && (
                  <button
                    type="button"
                    className="mark-read-button"
                    onClick={() => handleMarkAsRead(item.id)}
                  >
                    Mark as Read
                  </button>
                )}
              </article>
            );
          })
        )}
      </section>

      <p>
        <Link to="/student-dashboard">
          ← Back to Student Dashboard
        </Link>
      </p>
    </main>
  );
}

export default StudentNotifications;

