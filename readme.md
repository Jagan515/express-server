# MergeMoney – Server Side 

MergeMoney is a secure and scalable backend service built with Node.js, Express.js, and MongoDB. It powers a full-stack financial platform that combines peer-to-peer expense splitting with personal finance management, subscription billing, and role-based access control.

This repository contains the REST API, authentication system, authorization logic, payment integration, and database models.

---

## Live Demo

[Live Demo](https://expense-react-client-nine.vercel.app/)

## Architecture Overview

The backend follows a modular and scalable architecture:

* Express.js REST API
* MongoDB with Mongoose ODM
* JWT-based authentication (access + refresh tokens)
* OAuth 2.0 / OIDC (Google SSO)
* Role-Based Access Control (RBAC)
* Razorpay subscription integration
* Layered structure (controllers, services, models, middleware, validators)

The system is designed to be microservices-ready, allowing future separation of authentication, billing, and analytics services.

---

## Core Features

### 1. Authentication & Authorization

* JWT access tokens signed with `JWT_SECRET`
* Refresh tokens signed with `REFRESH_SECRET`
* Secure HTTP-only cookies
* Google OAuth 2.0 login
* Bcrypt password hashing
* Token expiration handling
* Middleware-based route protection

### 2. Role-Based Access Control (RBAC)

* Role-based authorization (Admin, User, Advisor, etc.)
* Multi-account financial access
* Controlled permissions for family members or financial advisors
* Middleware-level role validation

### 3. Financial Management APIs

* Expense tracking
* Group expense splitting
* Payment management
* Profile management
* Subscription handling

### 4. Performance Optimization

* Server-side pagination
* Sorting and filtering
* Optimized MongoDB queries
* Lean document responses where required

### 5. Payment Integration

* Razorpay subscription integration
* Webhook verification
* Monthly and yearly subscription plans
* Secure key management

---

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Google OAuth 2.0
* Razorpay
* Bcrypt
* dotenv

---

## Project Structure

```
express-server/
│
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── validators/
│   ├── dao/
│   └── constants/
│
├── server.js
├── package.json
└── .env
```

---

## Environment Variables

Create a `.env` file in the root directory:

```
MONGO_DB_CONNECTION_URL=
JWT_SECRET=
REFRESH_SECRET=
CLIENT_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECERET=
GOOGLE_EMAIL=
GOOGLE_APP_PASSWORD=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_MONTHLY_PLAN_ID=
RAZORPAY_YEARLY_PLAN_ID=
RAZORPAY_WEBHOOK_SECRET=
```

### Variable Explanation

MONGO_DB_CONNECTION_URL
MongoDB Atlas or local database connection string.

JWT_SECRET
Secret used to sign access tokens.

REFRESH_SECRET
Secret used to sign refresh tokens.

CLIENT_URL
Frontend URL for CORS configuration.

GOOGLE_CLIENT_ID
OAuth Client ID from Google Cloud Console.

GOOGLE_CLIENT_SECERET
OAuth Client Secret from Google Cloud Console.

GOOGLE_EMAIL
Email used for SMTP or application-level communication.

GOOGLE_APP_PASSWORD
App-specific password for secure email sending.

RAZORPAY_KEY_ID
Razorpay public API key.

RAZORPAY_KEY_SECRET
Razorpay secret key.

RAZORPAY_MONTHLY_PLAN_ID
Subscription plan ID for monthly billing.

RAZORPAY_YEARLY_PLAN_ID
Subscription plan ID for yearly billing.

RAZORPAY_WEBHOOK_SECRET
Secret used to verify Razorpay webhook authenticity.

---

## Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/your-username/mergemoney-server.git
cd mergemoney-server
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment variables

Create a `.env` file and populate all required keys.

### 4. Run in development mode

```
npm run dev
```

Or

```
node server.js
```

Server runs on:

```
http://localhost:PORT
```

---

## API Modules

* Authentication Controller
* Expense Controller
* Group Controller
* Profile Controller
* RBAC Controller
* Payment Controller

Each module follows:

* Route layer
* Controller logic
* Service abstraction
* Database interaction via DAO
* Validation layer

---

## Security Measures

* HTTP-only cookies
* SameSite configuration for production
* Secure flag enabled in production
* Password hashing using bcrypt
* Token expiration control
* Webhook signature verification
* CORS restrictions via CLIENT_URL

---

## Deployment

Recommended production stack:

* Node.js runtime
* MongoDB Atlas
* Environment variable-based secrets
* Reverse proxy (Nginx optional)
* HTTPS enforced
* Separate production and staging environments

---

## Best Practices Followed

* Separation of concerns
* Middleware-driven architecture
* Environment-based configuration
* Input validation layer
* Modular folder structure
* Production-ready cookie handling
* Centralized error handling

---

