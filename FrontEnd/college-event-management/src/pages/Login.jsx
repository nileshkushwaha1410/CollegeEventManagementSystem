
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL =
  "https://college-event-management-system-api.onrender.com/api/auth/login";

function Login() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@(aktu\.edu\.in|gmail\.com)$/i.test(normalizedEmail)) {
      setMessage("Use an @aktu.edu.in or @gmail.com email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to log in. Please try again.");
        return;
      }

      if (!data.token || !data.user) {
        setMessage("The server returned an incomplete login response.");
        return;
      }

      // Verify that the backend account matches the selected login type.
      if (
        (accountType === "admin" && data.user.role !== "admin") ||
        (accountType === "student" && data.user.role !== "student")
      ) {
        setMessage("This account does not match the selected login type.");
        return;
      }

      // Save the backend authentication token.
      localStorage.setItem("authToken", data.token);

      // Preserve the user information used by the existing frontend.
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          collegeName: data.user.collegeName || "",
          studentId: data.user.studentId || "",
          branch: data.user.branch || "",
          year: data.user.year || "",
        })
      );

      navigate(
        data.user.role === "admin"
          ? "/admin-dashboard"
          : "/student-dashboard",
        { replace: true }
      );
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        "Cannot connect to the server. Please check your internet connection and backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-back-link">
          ← Back to Home
        </Link>

        <span className="eyebrow">WELCOME BACK</span>
        <h1>Login</h1>

        <p className="auth-subtitle">
          Choose your account type to continue to CampusEvents.
        </p>

        <div className="auth-account-types">
          <button
            type="button"
            className={`auth-account-type ${
              accountType === "student" ? "active" : ""
            }`}
            onClick={() => {
              setAccountType("student");
              setMessage("");
            }}
            disabled={loading}
            aria-pressed={accountType === "student"}
          >
            🎓 Student Login
          </button>

          <button
            type="button"
            className={`auth-account-type ${
              accountType === "admin" ? "active" : ""
            }`}
            onClick={() => {
              setAccountType("admin");
              setMessage("");
            }}
            disabled={loading}
            aria-pressed={accountType === "admin"}
          >
            🏛️ Admin / College
          </button>
        </div>

        {accountType === "admin" && (
          <p className="auth-field-hint">
            Admin login is available only to approved college accounts.
          </p>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            placeholder="name@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {message && (
            <p className="auth-error" role="alert">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : accountType === "admin"
                ? "Login as Admin"
                : "Login as Student"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
