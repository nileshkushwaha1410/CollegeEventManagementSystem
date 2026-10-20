import { useState } from "react";
import "../App.css";
import { Link } from "react-router-dom";
import { useEvents } from "../context/EventContext";

function Home() {
  const { events } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
const [currentUser, setCurrentUser] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
  } catch {
    return null;
  }
});

const filteredEvents = events.filter((event) => {
  const matchesSearch =
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesCategory =
    selectedCategory === "All" ||
    event.category === selectedCategory;

  return matchesSearch && matchesCategory;
});

function handleLogout() {
  localStorage.removeItem("currentUser");
  setCurrentUser(null);
}

  return (
    <div className="app">
      <header className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">🎓</span>
          CampusEvents
        </a>

        
         <nav className="nav-links">
  <a href="#home">Home</a>
  <a href="#events">Events</a>
  <a href="#about">About</a>
  <Link to="/my-registrations">My Registrations</Link>
         </nav>

         
{currentUser ? (
  <div className="user-menu">
    <span>Hi, {currentUser.name}</span>
    <button
      className="login-button"
      onClick={handleLogout}
    >
      Logout
    </button>
  </div>
) : (
  <div className="user-menu">
    <Link to="/login" className="login-button">
      Login
    </Link>
    <Link to="/signup" className="signup-button">
      Sign Up
    </Link>
  </div>
)}

        
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">YOUR CAMPUS, YOUR EXPERIENCES</span>
            <h1>
              Discover Events.
              <br />
              <span>Make Memories.</span>
            </h1>
            <p>
              Find exciting college events, register for activities, and make
              the most of your campus life — all in one place.
            </p>
            <a href="#events" className="primary-button">
              Explore Events →
            </a>
          </div>

          <div className="hero-illustration">
            <span>🎓</span>
            <div className="floating-card">✨ Learn · Connect · Grow</div>
          </div>
        </section>

        <section className="stats">
          <div>
            <strong>01</strong>
            <span>One Campus Platform</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Sample Events</span>
          </div>
          <div>
            <strong>∞</strong>
            <span>Memories to Make</span>
          </div>
        </section>

        <section className="events-section" id="events">
          <div className="section-heading">
            <div>
              <span className="eyebrow">WHAT'S HAPPENING?</span>
              <h2>Upcoming Events</h2>
              <p>Find your next campus experience.</p>
            </div>
            <span className="event-count">{filteredEvents.length} events found</span>
          </div>
          
<div className="event-filters">
  <div className="search-box">
    <span>🔍</span>
    <input
      type="text"
      placeholder="Search events by name or description..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
  >
    <option value="All">All Categories</option>
    <option value="Technical">Technical</option>
    <option value="Cultural">Cultural</option>
    <option value="Entrepreneurship">Entrepreneurship</option>
  </select>
</div>

      
<div className="event-grid">
  {filteredEvents.length > 0 ? (
    filteredEvents.map((event) => (
      <article className="event-card" key={event.id}>
        <div className="event-icon">{event.icon}</div>
        <span className="category">{event.category}</span>
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>

        <div className="event-details">
          <span>📅 {event.date}</span>
          <span>📍 {event.venue}</span>
        </div>

        <Link
  to={`/events/${event.id}`}
  className="event-details-button"
>
  View Details →
</Link>

      </article>
    ))
  ) : (
    <p className="no-events">
      No events found. Try another search or category.
    </p>
  )}
</div>
        </section>

        <section className="about-section" id="about">
          <h2>Everything happening on campus, in one place.</h2>
          <p>
            A student-friendly platform to discover events and stay connected
            with college activities.
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 CampusEvents · College Event Management System</p>
      </footer>
    </div>
  );
}

export default Home;