
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/registrations/admin/all";

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminRegistrations() {
  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
  } catch {
    currentUser = null;
  }

  const token = localStorage.getItem("authToken");

  const [registrations, setRegistrations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRegistrations() {
      if (
        !currentUser ||
        currentUser.role !== "admin" ||
        !token
      ) {
        setLoading(false);
        setError("Please log in with your Admin account.");
        return;
      }

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load registrations."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        if (!cancelled) {
          setRegistrations(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Could not load student registrations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.role, token]);

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const filteredRegistrations = registrations.filter((record) => {
    if (statusFilter === "all") return true;
    return record.status === statusFilter;
  });

  const activeCount = registrations.filter(
    (record) => record.status === "registered"
  ).length;

  const cancelledCount = registrations.filter(
    (record) => record.status === "cancelled"
  ).length;

  const attendedCount = registrations.filter(
    (record) => record.status === "attended"
  ).length;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">COLLEGE EVENT MANAGEMENT</p>
          <h1>Student Registrations</h1>
          <p>View registrations recorded in the database.</p>
        </div>

        <Link to="/admin-dashboard" className="login-button">
          ← Admin Dashboard
        </Link>
      </header>

      <section className="dashboard-stats">
        <article className="dashboard-stat-card">
          <h3>Total Records</h3>
          <p>{registrations.length}</p>
        </article>

        <article className="dashboard-stat-card">
          <h3>Active</h3>
          <p>{activeCount}</p>
        </article>

        <article className="dashboard-stat-card">
          <h3>Cancelled</h3>
          <p>{cancelledCount}</p>
        </article>

        <article className="dashboard-stat-card">
          <h3>Attended</h3>
          <p>{attendedCount}</p>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="student-section-heading">
          <h2>Registration Records</h2>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter registrations by status"
          >
            <option value="all">All statuses</option>
            <option value="registered">Registered</option>
            <option value="cancelled">Cancelled</option>
            <option value="attended">Attended</option>
          </select>
        </div>

        {loading ? (
          <p>Loading student registrations...</p>
        ) : error ? (
          <div className="student-empty-state">
            <h3>Could not load registrations</h3>
            <p>{error}</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="student-empty-state">
            <h3>No registrations found</h3>
            <p>
              There are no records matching the selected status.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "12px" }}>Student</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>Event</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>Event Date</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>Registered On</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredRegistrations.map((record) => (
                  <tr key={record._id}>
                    <td style={{ padding: "12px" }}>
                      {record.student?.name || "Student unavailable"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {record.student?.email || "Not available"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {record.event?.title || "Event unavailable"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {formatDate(record.event?.date)}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {formatDate(record.registeredAt)}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {record.status || "registered"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminRegistrations;
