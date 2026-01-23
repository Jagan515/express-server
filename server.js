const express = require('express'); 
// require() is used to import dependencies in CommonJS (Node.js).
// It loads only what is needed, helping keep applications lightweight.

const app = express();

// Middleware to parse incoming JSON requests into JavaScript objects
app.use(express.json());

// In-memory users array (temporary storage)
let users = [];

app.post('/register', (request, response) => {
    // Destructuring data from request body
    const { name, email, password } = request.body;

    // Validation
    if (!name || !email || !password) {
        return response.status(400).json({
            message: 'Name, Email, and Password are required'
        });
    }

    // Create user object
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password // In real applications, always hash passwords
    };

   
    // Check if email already exists
    const existingUser = users.find(userEmail => userEmail.email === email);
    if (existingUser) {
        return response.status(409).json({
            message: `Email already registered: ${email}`
        });
    }

    

    // Store user
    users.push(newUser);

    // Success response
    return response.status(201).json({
        message: 'User registered successfully',
        user: { id: newUser.id }
    });
});

app.listen(5001, () => {
    console.log('Server is running on port 5001');
});

/**
 * Create a post api with path /login which wtakes in email and password
 * from body and check if user with same email and password exist in the 
 * users array .if yes return 200 reponse ,otherwise 400 response.
 */

app.post('/login', (request, response) => {
    const { email, password } = request.body;

    // Validation
    if (!email || !password) {
        return response.status(400).json({
            message: 'Email and password are required'
        });
    }

    // Check if user exists
    const validUser = users.find(
        user => user.email === email && user.password === password
    );

    if (validUser) {
        return response.status(200).json({
            message: 'User login successful'
        });
    } else {
        return response.status(400).json({
            message: 'Invalid email or password'
        });
    }
});