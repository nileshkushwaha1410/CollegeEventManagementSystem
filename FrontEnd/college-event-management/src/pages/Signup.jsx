
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL =
  "https://college-event-management-system-api.onrender.com/api/auth/register";

const ALLOWED_EMAIL_DOMAINS = ["aktu.edu.in", "gmail.com"];

function isAllowedEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const parts = normalizedEmail.split("@");

  return (
    parts.length === 2 &&
    parts[0].length > 0 &&
    ALLOWED_EMAIL_DOMAINS.includes(parts[1])
  );
}

function Signup() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("student");
  const [form, setForm] = useState({
    name: "",
    collegeName: "",
    email: "",
    mobile: "",
    studentId: "",
    branch: "",
    year: "",
    linkedin: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleAccountTypeChange(type) {
    setAccountType(type);
    setMessage("");
  }

  async function handleSignup(e) {
    e.preventDefault();
    setMessage("");

    const email = form.email.trim().toLowerCase();
    const mobile = form.mobile.trim();

    if (!isAllowedEmail(email)) {
      setMessage(
        "Please use an email address ending in @aktu.edu.in or @gmail.com."
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMessage("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (form.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Password and confirm password do not match.");
      return;
    }

    if (accountType === "student" && !form.studentId.trim()) {
      setMessage("Please enter your Student ID / Roll Number.");
      return;
    }

    if (
      accountType === "student" &&
      form.linkedin.trim() &&
      !/^https:\/\/(www\.)?linkedin\.com\/.+/i.test(form.linkedin.trim())
    ) {
      setMessage("Enter a valid LinkedIn profile URL starting with https://linkedin.com.");
      return;
    }

    setLoading(true);

    try {
      const payload =
        accountType === "student"
          ? {
              name: form.name.trim(),
              email,
              mobile,
              studentId: form.studentId.trim(),
              branch: form.branch,
              year: form.year,
              linkedin: form.linkedin.trim(),
              password: form.password,
              role: "student",
            }
          : {
              name: form.collegeName.trim(),
              collegeName: form.collegeName.trim(),
              email,
              mobile,
              password: form.password,
              role: "admin",
            };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create your account.");
        return;
      }

      setMessageType("success");
      setMessage(
        accountType === "admin"
          ? "College account registration submitted. Follow the approval instructions before accessing the admin dashboard."
          : "Student account created successfully! Redirecting to login..."
      );

      // Admin registration must be approved by the backend.
      // Do not grant admin dashboard access based only on this form.
      if (accountType === "student") {
        navigate("/login", {
          replace: true,
          state: {
            email,
            signupSuccess: true,
          },
        });
      }
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
          Choose your account type and enter your details.
        </p>

        <div
          className="auth-account-types"
          role="group"
          aria-label="Choose account type"
        >
          <button
            type="button"
            className={
              accountType === "student"
                ? "auth-account-type active"
                : "auth-account-type"
            }
            aria-pressed={accountType === "student"}
            onClick={() => handleAccountTypeChange("student")}
          >
            Student Account
          </button>

          <button
            type="button"
            className={
              accountType === "admin"
                ? "auth-account-type active"
                : "auth-account-type"
            }
            aria-pressed={accountType === "admin"}
            onClick={() => handleAccountTypeChange("admin")}
          >
            Admin / College
          </button>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          {accountType === "student" ? (
            <>
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />

              <label htmlFor="signup-studentId">
                Student ID / Roll Number
              </label>
              <input
                id="signup-studentId"
                name="studentId"
                type="text"
                placeholder="Enter your student ID or roll number"
                value={form.studentId}
                onChange={handleChange}
                required
              />

              <label htmlFor="signup-branch">Branch</label>
              <select
                id="signup-branch"
                name="branch"
                value={form.branch}
                onChange={handleChange}
                required
              >
                <option value="">Select your branch</option>
                <option value="CSE">Computer Science and Engineering</option>
                <option value="IT">Information Technology</option>
                <option value="ECE">
                  Electronics and Communication Engineering
                </option>
                <option value="EE">Electrical Engineering</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="CE">Civil Engineering</option>
                <option value="Other">Other</option>
              </select>

              <label htmlFor="signup-year">Academic year</label>
              <select
                id="signup-year"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
              >
                <option value="">Select your year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              <label htmlFor="signup-linkedin">
                LinkedIn Profile URL
              </label>
              <input
                id="signup-linkedin"
                name="linkedin"
                type="url"
                placeholder="https://www.linkedin.com/in/your-profile"
                value={form.linkedin}
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <label htmlFor="signup-collegeName">
                College full name
              </label>
              <input
                id="signup-collegeName"
                name="collegeName"
                type="text"
                placeholder="Enter the full name of your college"
                value={form.collegeName}
                onChange={handleChange}
                required
              />
            </>
          )}

          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            placeholder="name@gmail.com or name@aktu.edu.in"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <small className="auth-field-hint">
            Only @aktu.edu.in and @gmail.com addresses are allowed.
          </small>

          <label htmlFor="signup-mobile">Mobile number</label>
          <input
            id="signup-mobile"
            name="mobile"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={form.mobile}
            onChange={handleChange}
            maxLength={10}
            autoComplete="tel"
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            autoComplete="new-password"
            required
          />

          <label htmlFor="signup-confirmPassword">
            Confirm password
          </label>
          <input
            id="signup-confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
            minLength={8}
            autoComplete="new-password"
            required
          />

          {message && (
            <p
              className={
                messageType === "success"
                  ? "auth-success"
                  : "auth-error"
              }
              role="status"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : accountType === "student"
                ? "Create Student Account"
                : "Register College Account"}
          </button>

          {accountType === "admin" && (
            <p className="auth-field-hint">
              College administrator access must be verified by the server.
              Submitting this form must not automatically grant admin privileges.
            </p>
          )}
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default Signup;
