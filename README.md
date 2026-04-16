# CUET Computer Club

## Backend setup (Node.js + Express + MongoDB)

1. Go to backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create env file:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` values:
   - `MONGO_URI` = your MongoDB connection string
   - `JWT_SECRET` = strong random secret
   - `CORS_ORIGIN` = comma-separated frontend origins (for example `http://127.0.0.1:8080,http://localhost:8080`)
   - `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` = API rate limit settings
5. Run backend:
   ```bash
   npm run dev
   ```

Server runs at `http://localhost:5000`.

## API endpoints

- `POST /api/admin/register` - register admin
- `POST /api/admin/login` - login admin and get JWT
- `GET /api/admin/verify` - verify admin token (protected)
- `POST /api/cards` - create card (protected)
- `GET /api/cards` - get all cards (public)
- `PUT /api/cards/:id` - update card (protected)
- `DELETE /api/cards/:id` - delete card (protected)

Use `Authorization: Bearer <token>` header for protected routes.

## Frontend integration

- `admin-login.html` handles admin login and token storage in `localStorage`
- `admin-dashboard.html` provides admin CRUD controls for cards
- `index.html` loads cards from backend using Fetch API (`js/cards.js`)

Default frontend API URL in JS files: `http://localhost:5000/api`.
