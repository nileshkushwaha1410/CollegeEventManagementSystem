
import "./WelcomeScreen.css";

function WelcomeScreen({ onEnter }) {
  return (
    <main className="welcome-screen">
      <div className="welcome-grid" />

      <div className="welcome-particles" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => (
          <span
            className="welcome-particle"
            key={index}
            style={{
              "--i": index,
              "--x": `${(index * 37) % 100}%`,
              "--y": `${(index * 61) % 100}%`,
            }}
          />
        ))}
      </div>

      <section className="welcome-content">
        <div className="welcome-campus-mark">
          <div className="welcome-orbit welcome-orbit-one" />
          <div className="welcome-orbit welcome-orbit-two" />

          <div className="welcome-cube">
            <div className="cube-face cube-front">C</div>
            <div className="cube-face cube-back">E</div>
            <div className="cube-face cube-right">M</div>
            <div className="cube-face cube-left">✦</div>
            <div className="cube-face cube-top">✧</div>
            <div className="cube-face cube-bottom">C</div>
          </div>
        </div>

        <p className="welcome-eyebrow">
          MAA PATESHWARI DEVI RAJKIYA ENGINEERING COLLEGE, GONDA
        </p>

        <h1 className="welcome-title">
          Welcome to
          <span>CampusEvents</span>
        </h1>

        <p className="welcome-description">
          Discover events. Connect with your campus.
          <br />
          Make every college moment count.
        </p>

        <button
          className="welcome-enter-button"
          onClick={onEnter}
          type="button"
        >
          <span>Enter Website</span>
          <span className="welcome-arrow" aria-hidden="true">
            →
          </span>
        </button>

        <p className="welcome-footer">
          YOUR CAMPUS. YOUR COMMUNITY. YOUR MOMENTS.
        </p>
      </section>
    </main>
  );
}

export default WelcomeScreen;
