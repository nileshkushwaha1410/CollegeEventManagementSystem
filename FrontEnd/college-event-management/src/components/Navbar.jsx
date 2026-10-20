import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>

      <h2>CampusEvents</h2>

      <div>
        <Link to="/">Home</Link>

        <Link to="/events">Events</Link>

        <Link to="/about">About</Link>

        <button>Login</button>
      </div>

    </nav>
  );
}

export default Navbar;