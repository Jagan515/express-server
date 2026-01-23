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
