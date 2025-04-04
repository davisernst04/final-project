import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="text-center mt-5">
      <h1>Welcome to 'Give me a Hand!'</h1>
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <div className="card mb-4">
              <div className="card-body">
                <p className="card-text">
                  This is a channel-based tool for programmers to ask and answer
                  programming related questions. It is designed to be a friendly
                  and welcoming space for all levels of programmers.
                </p>
                <h6 className="mt-3">Key Features:</h6>
                <ul className="text-start">
                  <li>Create and join topic-specific channels</li>
                  <li>Post questions with code snippets and screenshots</li>
                  <li>Reply to posts and engage in nested discussions</li>
                  <li>Rate posts and replies with thumbs up/down</li>
                  <li>Search for specific content or users</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
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
