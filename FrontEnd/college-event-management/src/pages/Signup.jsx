
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
  "https://college-event-management-system-api.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to create your account."
        );
        return;
      }

      // Registration succeeds, but the user must log in
      // to obtain a backend authentication token.
      setMessage("Account created successfully! Redirecting to login...");

      navigate("/login", {
        replace: true,
        state: {
          email: email.trim().toLowerCase(),
          signupSuccess: true,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);

      setMessage(
        "Cannot connect to the server. Please check that the backend is running."
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

        <span className="eyebrow">JOIN CAMPUSEVENTS</span>
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Sign up to explore and register for college events.
        </p>

        <form onSubmit={handleSignup} className="auth-form">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default Signup;
