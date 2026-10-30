
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "./AdminCollegeApprovals.css";

const API_URL =
  "https://college-event-management-system-api.onrender.com/api/admin";

function AdminCollegeApprovals() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
  } catch {
    currentUser = null;
  }

  const token = localStorage.getItem("authToken");

  async function loadPendingColleges() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/colleges/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load college requests.");
      }

      setColleges(data.colleges || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentUser?.role === "admin" && token) {
      loadPendingColleges();
    } else {
      setLoading(false);
    }
  }, []);

  async function handleDecision(collegeId, action) {
    const actionName = action === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionName} this college account?`
    );

    if (!confirmed) return;

    setProcessingId(collegeId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/colleges/${collegeId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Action failed.");
      }

      setColleges((previous) =>
        previous.filter((college) => college._id !== collegeId)
      );

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  if (!currentUser || currentUser.role !== "admin" || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="college-approval-page">
      <header className="college-approval-header">
        <div>
          <p className="eyebrow">COLLEGE EVENT MANAGEMENT</p>
          <h1>College Account Approvals</h1>
          <p>Review and manage college administrator requests.</p>
        </div>

        <Link to="/admin-dashboard" className="login-button">
          ← Back to Dashboard
        </Link>
      </header>

      <section className="college-approval-section">
        <div className="student-section-heading">
          <h2>Pending Requests</h2>
          <span>{colleges.length} requests</span>
        </div>

        {message && (
          <p className="college-approval-success">{message}</p>
        )}

        {error && (
          <p className="college-approval-error">{error}</p>
        )}

        {loading ? (
          <p>Loading college requests...</p>
        ) : colleges.length === 0 ? (
          <div className="student-empty-state">
            <h3>No pending college requests.</h3>
            <p>All college account requests have been processed.</p>
          </div>
        ) : (
          <div className="college-approval-list">
            {colleges.map((college) => (
              <article className="college-approval-card" key={college._id}>
                <div className="college-approval-details">
                  <h3>{college.collegeName}</h3>
                  <p>Email: {college.email}</p>
                  <p>Mobile: {college.mobile}</p>
                  <p>Status: Pending Approval</p>
                </div>

                <div className="college-approval-actions">
                  <button
                    type="button"
                    disabled={processingId === college._id}
                    onClick={() =>
                      handleDecision(college._id, "approve")
                    }
                  >
                    {processingId === college._id
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    type="button"
                    disabled={processingId === college._id}
                    onClick={() =>
                      handleDecision(college._id, "reject")
                    }
                  >
                    {processingId === college._id
                      ? "Processing..."
                      : "Reject"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <button
          type="button"
          className="auth-submit-button"
          onClick={loadPendingColleges}
          disabled={loading}
        >
          Refresh Requests
        </button>
      </section>
    </main>
  );
}

export default AdminCollegeApprovals;
