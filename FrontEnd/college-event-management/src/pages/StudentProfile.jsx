
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "./StudentProfile.css";


function StudentProfile() {
    const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("currentUser") || "null"
      );

      if (!user) return;

      setCurrentUser(user);
      setName(user.name || "");

      const profiles = JSON.parse(
        localStorage.getItem("studentProfiles") || "{}"
      );

      const savedProfile = profiles[String(user.id)] || {};

      setPhone(savedProfile.phone || "");
      setCourse(savedProfile.course || "");
    } catch (error) 
    {
      console.error("Could not load student profile:", error);
    }
             finally {
      setLoading(false);
    } 
  }, []);

    if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedCourse = course.trim();

    if (!trimmedName) {
      setMessage("Please enter your name.");
      return;
    }

    if (trimmedPhone && !/^[0-9+\-\s()]{7,20}$/.test(trimmedPhone)) {
      setMessage("Please enter a valid contact number.");
      return;
    }

    try {
      const profiles = JSON.parse(
        localStorage.getItem("studentProfiles") || "{}"
      );

      profiles[String(currentUser.id)] = {
        phone: trimmedPhone,
        course: trimmedCourse,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "studentProfiles",
        JSON.stringify(profiles)
      );

      // Update the name in the current login session.
      const updatedUser = {
        ...currentUser,
        name: trimmedName,
      };

      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedUser)
      );

      // Keep the existing demo account record in sync, if available.
      const demoUsers = JSON.parse(
        localStorage.getItem("demoUsers") || "[]"
      );

      if (Array.isArray(demoUsers)) {
        const updatedUsers = demoUsers.map((user) =>
          String(user.id) === String(currentUser.id)
            ? { ...user, name: trimmedName }
            : user
        );

        localStorage.setItem(
          "demoUsers",
          JSON.stringify(updatedUsers)
        );
      }

      setCurrentUser(updatedUser);
      setName(trimmedName);
      setPhone(trimmedPhone);
      setCourse(trimmedCourse);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Could not save student profile:", error);
      setMessage("Could not save your profile. Please try again.");
    }
  }

  return (
    <main className="student-profile-page">
      <section className="student-profile-card">
        <div className="profile-heading">
          <div className="profile-avatar">
            {name.trim().charAt(0).toUpperCase() || "S"}
          </div>

          <p className="profile-eyebrow">STUDENT PORTAL</p>
          <h1>My Profile</h1>
          <p>View and update your personal details.</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <label htmlFor="profile-name">Full Name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
            maxLength={80}
            required
          />

          <label htmlFor="profile-email">Login Email</label>
          <input
            id="profile-email"
            type="email"
            value={currentUser.email || ""}
            readOnly
          />
          <small>
            Your login email is read-only to protect the existing login
            system.
          </small>

          <label htmlFor="profile-phone">Contact Number</label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter your contact number"
            maxLength={20}
          />

          <label htmlFor="profile-course">Branch / Course</label>
          <input
            id="profile-course"
            type="text"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
            placeholder="e.g. Computer Science and Engineering"
            maxLength={100}
          />

          {message && (
            <p
              className={
                message.includes("successfully")
                  ? "profile-message success"
                  : "profile-message error"
              }
              role="status"
            >
              {message}
            </p>
          )}

          <button type="submit" className="save-profile-button">
            Save Changes
          </button>
        </form>

        <Link
          to={
            currentUser.role === "admin"
              ? "/admin-dashboard"
              : "/student-dashboard"
          }
          className="profile-back-link"
        >
          ← Back to Dashboard
        </Link>
      </section>
    </main>
  );
}

export default StudentProfile;
