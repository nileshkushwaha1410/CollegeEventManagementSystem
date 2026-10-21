
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import initialEvents from "../data/events";

const EventContext = createContext(null);
const STORAGE_KEY = "collegeEvents";
const API_URL = "https://college-event-management-system-api.onrender.com/api/events";

function loadSavedEvents() {
  try {
    const savedEvents = localStorage.getItem(STORAGE_KEY);

    if (savedEvents !== null) {
      const parsedEvents = JSON.parse(savedEvents);

      if (Array.isArray(parsedEvents)) {
        return parsedEvents;
      }
    }
  } catch (error) {
    console.error("Could not load saved events:", error);
  }

  return initialEvents;
}

function normalizeEvent(event) {
  return {
    ...event,
    id: event._id || event.id,
    date: event.date ? String(event.date).slice(0, 10) : "",
    location: event.location || event.venue || "",
  };
}

function getAdminToken() {
  const token = localStorage.getItem("authToken");
  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  if (!token || currentUser?.role !== "admin") {
    throw new Error("Please log in with an Admin account first.");
  }

  return token;
}

async function adminRequest(url, method, body) {
  const token = getAdminToken();

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status}).`
    );
  }

  return data;
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState(loadSavedEvents);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not fetch events from the backend.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the event server.");
        }

        if (!cancelled) {
          setEvents(data.map(normalizeEvent));
          setEventsError("");
        }
      } catch (error) {
        console.error("Backend event loading failed:", error);

        if (!cancelled) {
          setEventsError(
            "Could not connect to the server. Showing saved events instead."
          );
        }
      } finally {
        if (!cancelled) {
          setEventsLoading(false);
        }
      }
    }

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error("Could not save events:", error);
    }
  }, [events]);

  // CREATE: Save the event to MongoDB first.
  async function addEvent(eventData) {
    try {
      const payload = {
        title: eventData.title,
        description: eventData.description || "",
        category: eventData.category || "Other",
        date: eventData.date,
        location: eventData.location || eventData.venue || "",
        image: eventData.image || "",
      };

      const createdEvent = await adminRequest(
        API_URL,
        "POST",
        payload
      );

      const newEvent = normalizeEvent(createdEvent);

      setEvents((currentEvents) => [
        ...currentEvents,
        newEvent,
      ]);

      setEventsError("");
      return newEvent;
    } catch (error) {
      setEventsError(error.message);
      console.error("Could not create event:", error);
      return null;
    }
  }

  // UPDATE: Save the changes to MongoDB first.
  async function updateEvent(eventId, updatedData) {
    try {
      const payload = {
        title: updatedData.title,
        description: updatedData.description || "",
        category: updatedData.category || "Other",
        date: updatedData.date,
        location: updatedData.location || updatedData.venue || "",
        image: updatedData.image || "",
      };

      const updatedEvent = await adminRequest(
        `${API_URL}/${eventId}`,
        "PUT",
        payload
      );

      const normalizedEvent = normalizeEvent(updatedEvent);

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          String(event.id) === String(eventId)
            ? normalizedEvent
            : event
        )
      );

      setEventsError("");
      return normalizedEvent;
    } catch (error) {
      setEventsError(error.message);
      console.error("Could not update event:", error);
      return null;
    }
  }

  // DELETE: Remove the event from MongoDB first.
  async function deleteEvent(eventId) {
    try {
      await adminRequest(
        `${API_URL}/${eventId}`,
        "DELETE"
      );

      setEvents((currentEvents) =>
        currentEvents.filter(
          (event) => String(event.id) !== String(eventId)
        )
      );

      setEventsError("");
      return true;
    } catch (error) {
      setEventsError(error.message);
      console.error("Could not delete event:", error);
      return false;
    }
  }

  return (
    <EventContext.Provider
      value={{
        events,
        eventsLoading,
        eventsError,
        addEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);

  if (!context) {
    throw new Error(
      "useEvents must be used inside EventProvider"
    );
  }

  return context;
}
