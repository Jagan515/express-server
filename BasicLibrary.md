# Important Libraries for MERN Stack (Backend)
## 1. express

### Purpose

Express is a **Node.js web framework** used to create APIs and handle HTTP requests.

### Why needed

* Routing (GET, POST, PUT, DELETE)
* Middleware support
* Faster API development

### Installation

```bash
npm install express
```

### Basic Usage

```js
const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000);
```

---

## 2. mongoose

### Purpose

Mongoose is an **ODM (Object Data Modeling) library** for MongoDB.

### Why needed

* Schema definition
* Data validation
* Easy database operations

### Installation

```bash
npm install mongoose
```

### Basic Usage

```js
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/mernDB");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

module.exports = mongoose.model("User", userSchema);
```

---

## 3. bcrypt / bcryptjs

### Purpose

Used to **hash passwords** before storing them in the database.

### Why needed

* Prevents storing plain-text passwords
* Protects users if database is compromised

### Installation

```bash
npm install bcrypt
```

### How it works

* Converts password into a hashed string
* Hash cannot be reversed

### Usage

```js
const bcrypt = require("bcrypt");

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Compare password
const isMatch = await bcrypt.compare(password, hashedPassword);
```

---

## 4. jsonwebtoken (JWT)

### Purpose

Used to create and verify **authentication tokens**.

### Why needed

* Stateless authentication
* Secure API access
* Used in login systems

### Installation

```bash
npm install jsonwebtoken
```

### Create Token

```js
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);
```

### Verify Token (Middleware)

```js
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
```

---

## 5. cookie-parser

### Purpose

Parses cookies from incoming HTTP requests.

### Why needed

* Access JWT stored in cookies
* Secure authentication using HttpOnly cookies

### Installation

```bash
npm install cookie-parser
```

### Usage

```js
const cookieParser = require("cookie-parser");

app.use(cookieParser());

// Access cookie
req.cookies.token;
```

### Setting Cookie

```js
res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict"
});
```

---

## 6. cors

### Purpose

Handles **Cross-Origin Resource Sharing**.

### Why needed

* Allows frontend (React) to communicate with backend
* Prevents browser blocking API calls

### Installation

```bash
npm install cors
```

### Usage

```js
const cors = require("cors");

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
```

---

## 7. dotenv

### Purpose

Loads environment variables from `.env` file.

### Why needed

* Protects sensitive data (DB URL, JWT secret)
* Keeps config separate from code

### Installation

```bash
npm install dotenv
```

### Usage

```js
require("dotenv").config();

const secret = process.env.JWT_SECRET;
```

`.env` file:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mernDB
JWT_SECRET=mysecretkey
```

---

## 8. nodemon (Development Tool)

### Purpose

Automatically restarts server on code changes.

### Installation

```bash
npm install --save-dev nodemon
```

### Usage

```json
"scripts": {
  "start": "nodemon index.js"
}
```

---


# Typical Authentication Flow Using These Libraries

1. User registers
2. Password hashed using bcrypt
3. User logs in
4. JWT generated using jsonwebtoken
5. JWT stored in cookie using cookie-parser
6. Protected routes verify JWT
7. Database handled by mongoose

---

# Summary Table

| Library       | Purpose               |
| ------------- | --------------------- |
| express       | API framework         |
| mongoose      | MongoDB interaction   |
| bcrypt        | Password hashing      |
| jsonwebtoken  | Authentication token  |
| cookie-parser | Cookie handling       |
| cors          | Cross-origin requests |
| dotenv        | Environment variables |
| nodemon       | Dev auto-restart      |

---


