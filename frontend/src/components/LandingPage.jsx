import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="text-center mt-5">
      <h1>Welcome to the Programming Forum</h1>
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">About This Forum</h5>
                <p className="card-text">
                  This is a community-driven platform where programmers of all
                  skill levels can ask questions, share knowledge, and help each
                  other solve coding problems.
                </p>
                <p className="card-text">
                  Whether you're a beginner looking for guidance or an expert
                  wanting to share your knowledge, this forum is the perfect
                  place for you.
                </p>
                <h6 className="mt-3">Key Features:</h6>
                <ul className="text-start">
                  <li>Create and join topic-specific channels</li>
                  <li>Post questions with code snippets and screenshots</li>
                  <li>Reply to posts and engage in nested discussions</li>
                  <li>Rate posts and replies with thumbs up/down</li>
                  <li>Search for specific content or users</li>
                  <li>
                    User classification system (beginner, intermediate, expert)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {user ? (
          <Link to="/channels" className="btn btn-primary btn-lg">
            Browse Channels
          </Link>
        ) : (
          <div>
            <Link to="/login" className="btn btn-primary btn-lg me-3">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
