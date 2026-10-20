
import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { useEvents } from "../context/EventContext";


function StudentScanAttendance() {
  const { events } = useEvents();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isScanning, setIsScanning] = useState(true);

  const processedRef = useRef(false);

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
  } catch {
    currentUser = null;
  }

  const isStudent = currentUser?.role === "student";

  useEffect(() => {
    if (!isStudent || !isScanning) return;

    let scanner = null;
    let cancelled = false;

    processedRef.current = false;

    async function startScanner() {
      try {
        scanner = new Html5Qrcode("attendance-reader");

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 230, height: 230 },
          },
          async (decodedText) => {
            if (processedRef.current) return;

            

            processedRef.current = true;

            try {
              if (scanner?.isScanning) {
                await scanner.stop();
              }
            } catch (error) {
              console.error("Could not stop scanner:", error);
            }

            if (cancelled) return;

            setIsScanning(false);

          
            if (!event) {
              setMessage(
                "This event was not found. Please ask the admin to check the QR code."
              );
              setMessageType("error");
              return;
            }

            
const authToken = localStorage.getItem("authToken");

if (!authToken) {
  setMessage("Your login session has expired. Please log in again.");
  setMessageType("error");
  return;
}

try {
  const response = await fetch(
    "http://localhost:5000/api/registrations/attendance/scan",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ qrToken: decodedText }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Could not record attendance.");
  }

  setMessage(data.message || "Attendance recorded successfully!");
  setMessageType("success");
} catch (error) {
  setMessage(error.message || "Could not record attendance.");
  setMessageType("error");
}


          },
          () => {
            // QR codes are checked repeatedly while the camera is active.
            // Ignore individual frames that do not contain a readable code.
          }
        );

        if (cancelled && scanner?.isScanning) {
          await scanner.stop();
          scanner.clear();
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Camera error:", error);
          setMessage(
            "Unable to open the camera. Allow camera permission and try again."
          );
          setMessageType("error");
          setIsScanning(false);
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;

      if (scanner) {
        const stopScanner = async () => {
          try {
            if (scanner.isScanning) {
              await scanner.stop();
            }
            scanner.clear();
          } catch {
            // The scanner may already have stopped.
          }
        };

        stopScanner();
      }
    };
 }, [isStudent, isScanning, currentUser?.id]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "student") {
    return <Navigate to="/" replace />;
  }

  function scanAgain() {
    setMessage("");
    setMessageType("");
    processedRef.current = false;
    setIsScanning(true);
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">STUDENT PORTAL</span>
          <h1>Scan Event QR</h1>
          <p>
            Scan the QR code displayed by your event administrator
            to record attendance.
          </p>
        </div>

        <Link to="/student-dashboard" className="login-button">
          Back to Dashboard
        </Link>
      </header>

      <section className="dashboard-section">
        <h2>Attendance Scanner</h2>

        <p>
          Logged in as: <strong>{currentUser.name || currentUser.email}</strong>
        </p>

        {isScanning && (
          <>
            <p>Allow camera access when your browser asks for permission.</p>

            <div
              id="attendance-reader"
              style={{
                maxWidth: "500px",
                width: "100%",
                margin: "20px auto",
              }}
            />
          </>
        )}

        {message && (
          <div
            role="status"
            style={{
              padding: "14px",
              marginTop: "20px",
              borderRadius: "8px",
              background:
                messageType === "success" ? "#dcfce7" : "#fee2e2",
              color:
                messageType === "success" ? "#166534" : "#991b1b",
            }}
          >
            {message}
          </div>
        )}

        {!isScanning && (
          <button
            type="button"
            className="auth-submit-button"
            onClick={scanAgain}
            style={{ marginTop: "20px" }}
          >
            Scan Another QR Code
          </button>
        )}
      </section>

      <footer className="dashboard-footer">
        <Link to="/my-registrations">My Registrations</Link>
        {" · "}
        <Link to="/">Home</Link>
      </footer>
    </main>
  );
}

export default StudentScanAttendance;
