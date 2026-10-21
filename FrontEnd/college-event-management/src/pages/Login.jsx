
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // First, try logging in through the backend.
      const response = await fetch(
  "https://college-event-management-system-api.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Save the JWT for protected backend requests.
        localStorage.setItem("authToken", data.token);

        // Preserve the user format used by your existing frontend.
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          })
        );

        navigate(
          data.user.role === "admin"
            ? "/admin-dashboard"
            : "/student-dashboard"
        );

        return;
      }

      // If the backend is reachable but the account is not
      // registered there, allow an existing local student to log in.
      if (response.status !== 401) {
        setMessage(
          data.message || "Unable to log in. Please try again."
        );
        return;
      }

      const users = JSON.parse(
        localStorage.getItem("demoUsers") || "[]"
      );

      const user = users.find(
        (item) =>
          item.email?.trim().toLowerCase() === normalizedEmail &&
          item.password === password
      );

      if (user) {
        // This is a legacy local account, not a backend session.
        localStorage.removeItem("authToken");

        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: "student",
          })
        );

        navigate("/student-dashboard");
        return;
      }

      setMessage("Invalid email or password.");
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Cannot connect to the server. Please check that your backend is running."
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
          Log in to continue exploring campus events.
        </p>

        <form onSubmit={handleLogin} className="auth-form">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Logging in..." : "Log In"}
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
