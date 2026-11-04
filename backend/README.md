# ParkShare Backend (Auth)

Express + MongoDB (Mongoose). Passwords are hashed with bcrypt, logins return a signed JWT.

## Roles
- `admin`: exactly one. Created only by `npm run seed:admin`. A unique partial index makes MongoDB reject a second admin.
- `owner` and `driver`: everyone else. People pick one when they sign up at `/auth?mode=signup`.

## Setup
1. Get a MongoDB database. Pick one:
   - **Atlas (no install):** create a free cluster at mongodb.com/atlas, add a database user, allow your IP under Network Access, then copy the connection string.
   - **Local:** install MongoDB Community Server (it runs as a Windows service) and use `mongodb://127.0.0.1:27017/parkshare`.
2. In this folder:
   ```bash
   npm install
   copy .env.example .env      # macOS/Linux: cp .env.example .env
   ```
3. Edit `.env`:
   - `MONGODB_URI`: your connection string (Atlas needs your real password in it)
   - `JWT_SECRET`: at least 32 characters
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`: your own admin login (password 10+ characters)
4. Create the admin account:
   ```bash
   npm run seed:admin
   ```
5. Start the API:
   ```bash
   npm run dev
   ```
   Check http://localhost:5000/api/health shows `{"status":"ok"}`.

Collections and indexes are created automatically. There is no separate database setup step.

Then run the frontend (`npm install` and `npm run dev` in `frontend/`) and log in at http://localhost:5173/auth.

## Endpoints
| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/api/auth/register` | `name, email, password, role` (`driver` or `owner`) | `201 { token, user }` |
| POST | `/api/auth/login` | `email, password, remember` | `{ token, user }` |
| GET | `/api/auth/me` | Bearer token | `{ user }` |
| POST | `/api/auth/forgot-password` | `email` | generic message (email sending not built yet) |

Errors come back as `{ "detail": "..." }`. Login and signup are rate limited.
