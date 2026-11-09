
# Sweety – Blood Glucose Tracker

Sweety is a full-stack web application that helps users record, manage, and monitor their daily blood glucose readings. Users can securely register, log in, manage glucose readings, and view daily and monthly reports.

## Features

- User registration and login.
- Secure password hashing using bcrypt.
- JWT-based authentication.
- Add, view, edit, and delete glucose readings.
- Four reading slots:
  - Morning fasting
  - After breakfast
  - After lunch
  - After dinner
- Validation of glucose values (40–600 mg/dL).
- Prevents duplicate readings for the same slot and date.
- Prevents future-dated readings.
- Daily glucose reports.
- Monthly glucose reports.
- User-specific data access.

## Technology Stack

### Frontend
- React
- JavaScript
- CSS
- Vite

### Backend
- Node.js
- Express.js
- PostgreSQL
- bcrypt
- JSON Web Token (JWT)

## Project Structure

```text
Sweety/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   ├── server.js
│   ├── seed.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

## Prerequisites

Install the following before running the application:

- Node.js
- npm
- PostgreSQL
- Git

## Database Setup

1. Open PostgreSQL.
2. Create a database named `sweety_db`.
3.  Run the schema file from the project root:

   psql -U postgres -d sweety_db -f backend/schema.sql
4. Create the `users` and `readings` tables using the database schema provided with the project.
5. Configure the backend environment variables.

## Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder using `.env.example` as a reference.

Add your PostgreSQL credentials and a secure JWT secret.

Start the backend:

```bash
node server.js
```

The backend runs at:

http://localhost:5000

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

http://localhost:5173

## Demo Account

The seed script creates a demo account:

- Email: demo@example.com
- Password: DemoPass123

Run the seed script from the backend folder:

```bash
node seed.js
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a user |
| POST | /api/auth/login | Log in |

### Glucose Readings

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/readings | Get user readings |
| POST | /api/readings | Add a reading |
| PUT | /api/readings/:id | Update a reading |
| DELETE | /api/readings/:id | Delete a reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reports/daily?date=YYYY-MM-DD | Daily report |
| GET | /api/reports/monthly?month=YYYY-MM | Monthly report |

Protected endpoints require a JWT bearer token.

## Validation Rules

- All required fields must be provided.
- Glucose values must be whole numbers between 40 and 600 mg/dL.
- Only the four predefined reading slots are accepted.
- Only one reading is allowed per slot per day for each user.
- Future dates are not allowed.
- Users can access only their own readings.

## Testing

The following features have been tested:

- User registration and login.
- Password hashing and authentication.
- Adding glucose readings.
- Editing glucose readings.
- Deleting glucose readings.
- Duplicate reading validation.
- Daily reports.
- Monthly reports.
- Protected API access.

## Assumptions and Future Improvements

- Each user can record a maximum of four readings per day, one for each slot.
- Glucose values are stored in mg/dL.
- Future improvements may include graphical trend charts, downloadable reports, pagination, and deployment to a cloud platform.

## Author

Developed as a full-stack application using React, Node.js, Express.js, and PostgreSQL.
