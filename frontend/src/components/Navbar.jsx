import { Link, useNavigate } from "react-router-dom";
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  Button,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          Give me a Hand!
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link as={Link} to="/channels">
                  Channels
                </Nav.Link>
                <Nav.Link as={Link} to="/search">
                  Search
                </Nav.Link>
                {user.role === "admin" && (
                  <Nav.Link as={Link} to="/create-channel">
                    Create Channel
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          <Nav>
            {user ? (
              <>
                <BootstrapNavbar.Text className="me-3">
                  Welcome, {user.name}
                  {user.classification && (
                    <span
                      className={`badge ms-2 bg-${getClassificationColor(user.classification)}`}
                    >
                      {user.classification}
                    </span>
                  )}
                </BootstrapNavbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline-light"
                  className="me-2"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button variant="primary" onClick={() => navigate("/register")}>
                  Register
                </Button>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

// Helper function to get badge color based on classification
function getClassificationColor(classification) {
  switch (classification) {
    case "beginner":
      return "success";
    case "intermediate":
      return "primary";
    case "expert":
      return "danger";
    default:
      return "secondary";
  }
}

export default Navbar;
