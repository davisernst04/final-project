# Give Me a Hand

A programming discussion forum built with React, Express, and MySQL. Users can create and join topic-specific channels, post questions with code and screenshots, reply in nested discussions, rate contributions, and search for content or other users.

## Structure

- `frontend/`: React application with React Router and Bootstrap.
- `backend/`: Express API.
- `init.sql`: MySQL schema.
- `docker-compose.yml`: local database, API, and frontend services.

## Local development

With Docker Compose installed, run `docker compose up --build`. The local frontend uses port 3000, API port 8080, and database port 3306.

The Compose configuration contains development database credentials and an explicit placeholder JWT signing secret. These are examples, not production configuration. Replace them with your own environment-managed values before using real accounts or deploying. This coursework snapshot also retains vendored backend dependencies; their original license notices remain included. The repository has not been certified for production deployment.

## License

MIT for the project source. See LICENSE. Third-party dependencies retain their own licenses.
