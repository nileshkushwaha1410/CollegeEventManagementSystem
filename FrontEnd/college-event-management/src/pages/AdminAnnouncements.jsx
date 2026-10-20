
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getAnnouncements,
  saveAnnouncements,
} from "../utils/announcements";


import "./AdminAnnouncements.css";

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState(
    () => getAnnouncements()
  );

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("General");
  const [notice, setNotice] = useState("");
const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("All");

  function handlePublish(event) {
    event.preventDefault();

    if (!title.trim() || !message.trim()) {
      setNotice("Please enter both a title and a message.");
      return;
    }

    const newAnnouncement = {
      id: `announcement-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      category,
      createdAt: new Date().toISOString(),
    };

    const updatedAnnouncements = [
      newAnnouncement,
      ...announcements,
    ];

    try {
      saveAnnouncements(updatedAnnouncements);
      setAnnouncements(updatedAnnouncements);
      setTitle("");
      setMessage("");
      setCategory("General");
      setNotice("Announcement published successfully!");
    } catch (error) {
      console.error("Could not publish announcement:", error);
      setNotice("Could not save the announcement. Please try again.");
    }
  }

  function handleDelete(id) {
    const updatedAnnouncements = announcements.filter(
      (item) => item.id !== id
    );

    try {
      saveAnnouncements(updatedAnnouncements);
      setAnnouncements(updatedAnnouncements);
      setNotice("Announcement deleted.");
    } catch (error) {
      console.error("Could not delete announcement:", error);
      setNotice("Could not delete the announcement.");
    }
  }

  
const filteredAnnouncements = announcements.filter((item) => {
  const search = searchTerm.trim().toLowerCase();

  const matchesSearch = [
    item.title,
    item.message,
    item.category,
  ].some((value) =>
    String(value || "").toLowerCase().includes(search)
  );

  const matchesCategory =
    selectedCategory === "All" ||
    item.category === selectedCategory;

  return matchesSearch && matchesCategory;
});


  return (
    <main className="announcements-page">
      <header className="announcements-header">
        <p>ADMIN PANEL</p>
        <h1>Announcements</h1>
        <p>
          Publish important updates for students and manage
          existing announcements.
        </p>
      </header>

      <section className="announcement-form-section">
        <h2>Create Announcement</h2>

        <form onSubmit={handlePublish}>
          <label htmlFor="announcement-title">
            Announcement Title
          </label>
          <input
            id="announcement-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Annual Fest Registration Open"
            required
          />

          <label htmlFor="announcement-category">
            Category
          </label>
          <select
            id="announcement-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="General">General</option>
            <option value="Event Update">Event Update</option>
            <option value="Schedule Change">Schedule Change</option>
            <option value="Important">Important</option>
          </select>

          <label htmlFor="announcement-message">
            Message
          </label>
          <textarea
            id="announcement-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write the announcement details..."
            rows={5}
            required
          />

          <button type="submit">
            Publish Announcement
          </button>
        </form>

        {notice && <p role="status">{notice}</p>}
      </section>

      
<section className="announcement-list-section">
  <h2>Published Announcements</h2>

  <div className="announcement-filters">
    <input
      type="search"
      placeholder="Search announcements..."
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
      aria-label="Search announcements"
    />

    <select
      value={selectedCategory}
      onChange={(event) => setSelectedCategory(event.target.value)}
      aria-label="Filter announcements by category"
    >
      <option value="All">All Categories</option>
      <option value="General">General</option>
      <option value="Event Update">Event Update</option>
      <option value="Schedule Change">Schedule Change</option>
      <option value="Important">Important</option>
    </select>
  </div>

  <p>
    Showing {filteredAnnouncements.length} of {announcements.length} announcements
  </p>


        {announcements.length === 0 ? (
          <p>No announcements published yet.</p>
        ) : (
          announcements.map((item) => (
            <article
              className="announcement-card"
              key={item.id}
            >
              <p>{item.category}</p>
              <h3>{item.title}</h3>
              <p>{item.message}</p>
              <small>
                Published:{" "}
                {new Date(item.createdAt).toLocaleString()}
              </small>

              <div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <p>
        <Link to="/admin-dashboard">
          ← Back to Admin Dashboard
        </Link>
      </p>
    </main>
  );
}

export default AdminAnnouncements;
