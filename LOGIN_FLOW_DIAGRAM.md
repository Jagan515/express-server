# Login Flow Diagram - MERN Application

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                            │
│                    example-client                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   HTTP REQUEST (Axios)                          │
│              POST http://localhost:5003/auth/login              │
│            Headers: { withCredentials: true }                   │
│            Body: { email, password }                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express)                           │
│                    example-server                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                           │
│              User Collection (User Model)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Client-Side Login Flow

```
┌───────────────────────────────────────────────────────┐
│  User Opens Login Page (Login.jsx)                    │
│  - Initialize state: email="", password=""            │
│  - Render form with Email & Password inputs           │
└───────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────┐
│  User Enters Credentials & Clicks Login               │
│  - handleChange() updates state on input change       │
└───────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────┐
│  handleFormSubmit() TRIGGERED (event.preventDefault)  │
└───────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────┐
│  VALIDATION: validate()                               │
│  ├─ Check: email.length > 0 ?                         │
│  ├─ Check: password.length > 0 ?                      │
│  └─ If validation fails → Display errors, STOP       │
└───────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────┐
│  BUILD REQUEST PAYLOAD                                │
│  {                                                    │
│    email: "user@example.com",                         │
│    password: "user123"                                │
│  }                                                    │
│  config: { withCredentials: true }                    │
│  (Allows cookies to be sent & received)               │
└───────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────┐
│  SEND AXIOS POST REQUEST                              │
│  axios.post(                                          │
│    "http://localhost:5003/auth/login",                │
│    body,                                              │
│    config                                             │
│  )                                                    │
└───────────────────────────────────────────────────────┘
                         ↓
                    [TO BACKEND]
                         ↓
                    (See next section)
```

---

## Detailed Server-Side Login Flow

```
┌──────────────────────────────────────────────────────────┐
│  REQUEST RECEIVED at POST /auth/login                    │
│  (authRoutes.js → routes to authController.login)        │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  EXTRACT DATA from req.body                              │
│  const { email, password } = req.body                    │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  VALIDATION CHECK                                        │
│  if (!email || !password)                                │
│    → Return 400: "Email and Password are required"       │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  QUERY DATABASE                                          │
│  userDao.findByEmail(email)                              │
│  ├─ Execute: User.findOne({ email })                     │
│  └─ Return: user object or null                          │
└──────────────────────────────────────────────────────────┘
                         ↓
            ┌────────────┴────────────┐
            ↓                         ↓
    ┌─────────────────┐      ┌──────────────────┐
    │  User FOUND     │      │  User NOT FOUND  │
    └─────────────────┘      └──────────────────┘
            ↓                         ↓
    (Continue)              Return 401: "Invalid credentials"
            ↓                         ↓
            └────────────┬────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  PASSWORD VALIDATION (if user exists)                    │
│  bcrypt.compare(password, user.password)                 │
│  ├─ Compare plaintext password with stored hash          │
│  └─ Return: true/false                                   │
└──────────────────────────────────────────────────────────┘
                         ↓
            ┌────────────┴─────────────┐
            ↓                          ↓
    ┌─────────────────┐      ┌──────────────────┐
    │  PASSWORD MATCH │      │  PASSWORD WRONG  │
    └─────────────────┘      └──────────────────┘
            ↓                          ↓
    (Continue)              Return 401: "Invalid credentials"
            ↓                          ↓
            └────────────┬─────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  GENERATE JWT TOKEN                                      │
│  jwt.sign(                                               │
│    { userId: user._id, email: user.email },              │
│    process.env.JWT_SECRET,                               │
│    { expiresIn: '1h' }                                    │
│  )                                                       │
│  → Token valid for 1 hour                                │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  SET HTTP-ONLY COOKIE                                    │
│  res.cookie('jwtToken', token, {                         │
│    httpOnly: true,        // Not accessible via JS       │
│    secure: false,         // true only in HTTPS          │
│    sameSite: 'strict'     // CSRF protection             │
│  })                                                      │
│  → Token stored in browser cookie                        │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  SEND SUCCESS RESPONSE                                   │
│  Status: 200                                             │
│  {                                                       │
│    message: "Login successful"                           │
│  }                                                       │
└──────────────────────────────────────────────────────────┘
                         ↓
            [RESPONSE SENT TO CLIENT]
```

---

## Complete End-to-End Flow

```
CLIENT SIDE                          SERVER SIDE                    DATABASE
────────────────────────────────────────────────────────────────────────────

User fills form
      ↓
User clicks Login
      ↓
Validate input ─────────────→ (Validation on client)
      ↓
Create payload
      ↓
Send POST request ──────────→ Receive request
                                    ↓
                           Extract email & password
                                    ↓
                           Validate input
                                    ↓
                           Query user by email ────→ MongoDB: findOne()
                                    ↓                      ↓
                           Receive user (or null)  ← User document (or null)
                                    ↓
                           ✓ User exists?
                                    ↓
                           Compare password hash
                                    ↓
                           ✓ Password matches?
                                    ↓
                           Generate JWT
                                    ↓
                           Set HTTP-Only cookie
                                    ↓
                           Send 200 response ────→ Receive response
      ↓                                    ↓
Display success msg                 Cookie stored in browser
      ↓
Can now make authenticated requests
```

---

## Data Structures

### Request Body (Client → Server)
```javascript
{
  email: "user@example.com",
  password: "password123"
}
```

### User Document (MongoDB)
```javascript
{
  _id: ObjectId("..."),
  username: "john_doe",
  email: "user@example.com",
  password: "$2a$10$...", // Bcrypt hashed password
  createdAt: ISODate("2026-01-30T...")
}
```

### JWT Token Payload
```javascript
{
  userId: "user_id_from_mongodb",
  email: "user@example.com",
  iat: 1706600000,    // Issued at
  exp: 1706603600     // Expires in 1 hour
}
```

### Response Body (Server → Client)
```javascript
{
  message: "Login successful"
}
// Plus HTTP-Only cookie: jwtToken = <JWT_TOKEN>
```

---

## Key Security Features

1. **Password Hashing**: Uses bcryptjs to hash passwords before storing
2. **HTTP-Only Cookies**: JWT token cannot be accessed by JavaScript (XSS protection)
3. **CORS with Credentials**: `withCredentials: true` allows cookies to be sent
4. **SameSite Cookie**: `sameSite: 'strict'` prevents CSRF attacks
5. **Token Expiration**: JWT expires after 1 hour
6. **Error Messages**: Generic "Invalid credentials" prevents user enumeration

---

## Error Scenarios

```
SCENARIO 1: Missing Credentials
User submits empty form
         ↓
Client validation fails (if email or password empty)
         ↓
Display error: "Email is required" / "Password is required"
         ↓
Request NOT sent

SCENARIO 2: User Not Found
Valid form submitted, but email doesn't exist
         ↓
POST /auth/login
         ↓
userDao.findByEmail() returns null
         ↓
Return 401: "Invalid credentials"
         ↓
Display error on client: "Login failed. Please check your credentials."

SCENARIO 3: Wrong Password
User exists but password incorrect
         ↓
POST /auth/login
         ↓
User found, but bcrypt.compare() returns false
         ↓
Return 401: "Invalid credentials"
         ↓
Display error on client: "Login failed. Please check your credentials."

SCENARIO 4: Server Error
Database connection fails
         ↓
POST /auth/login
         ↓
Exception thrown during userDao.findByEmail()
         ↓
Express error handler (or server crashes)
         ↓
Network error on client
         ↓
Catch block displays: "Login failed: Network Error"
```

---

## Component Dependencies

```
Login.jsx
├── Uses: React (useState)
├── Uses: axios (HTTP client)
└── Dependencies:
    ├── http://localhost:5003 (Backend API)
    └── CORS enabled with credentials

authRoutes.js
├── Imports: express.Router
├── Imports: authController
└── Routes:
    ├── POST /register → authController.register
    └── POST /login → authController.login

authController.js
├── Imports: userDao (Database access)
├── Imports: bcryptjs (Password hashing)
├── Imports: jsonwebtoken (JWT generation)
└── Functions:
    ├── login(req, res)
    └── register(req, res)

userDao.js
├── Imports: User model
└── Methods:
    ├── findByEmail(email)
    └── create(userData)

User.js (Model)
├── Uses: mongoose.Schema
├── Fields: username, email, password, createdAt
└── Constraints: email unique, all required
```

---

## Authentication Flow After Login

Once login is successful, subsequent requests to protected routes work like this:

```
Browser has jwtToken cookie
         ↓
Client makes request with { withCredentials: true }
         ↓
Browser automatically includes cookie in request headers
         ↓
Server receives request + cookie
         ↓
authMiddleware extracts JWT from cookie
         ↓
Verify JWT using process.env.JWT_SECRET
         ↓
✓ If valid: Proceed to protected route
✗ If invalid/expired: Return 401 Unauthorized
```
