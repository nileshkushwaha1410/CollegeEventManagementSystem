function EventCard({ event }) {
  return (
    <div className="event-card">

      <div className="event-image">
        <span>{event.category}</span>
      </div>

      <div className="event-content">
        <h3>{event.title}</h3>

        <p>{event.description}</p>

        <div className="event-info">
          <span>📅 {event.date}</span>
          <span>📍 {event.venue}</span>
        </div>

        <button>View Details</button>
      </div>

    </div>
  )
}

export default EventCard