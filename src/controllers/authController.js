// Import users data from userDb file
// This is currently an in-memory array (not a real database)
const users = require('../dao/userDb');

// Controller object that contains authentication logic
const authController = {

    // LOGIN FUNCTION
    // Handles user login requests
    login: (req, res) => {

        // Destructuring email and password from request body
        // This extracts values sent from the client (Postman / frontend)
        const { email, password } = req.body;

        // Validation: check if email or password is missing
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and Password are required"
            });
        }

        // Find user in users array that matches email and password
        // Array.find() returns the first matching user or undefined
        const user = users.find(
            u => u.email === email && u.password === password
        );

        // If no matching user is found, credentials are invalid
        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        // Log successful login in server console
        console.log("Logging in user:", email);

        // Send success response with user ID
        return res.status(200).json({
            message: "Login successful",
            userId: user.id
        });
    },

    // REGISTER FUNCTION
    // Handles new user registration
    register: (req, res) => {

        // Destructuring username, email, and password from request body
        const { username, email, password } = req.body;

        // Validation: ensure all required fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        // Check if a user with the same email already exists
        const userExists = users.find(
            user => user.email === email
        );

        // If user already exists, return conflict response
        if (userExists) {
            return res.status(409).json({
                error: "User already exists"
            });
        }

        // Create a new user object
        // ID is generated based on array length
        const newUser = {
            id: users.length + 1,
            username: username,
            email: email,
            password: password // Password stored as plain text (not secure)
        };

        // Add new user to users array
        users.push(newUser);

        // Log registration details in server console
        console.log("Registering user:", username, email);

        // Send success response with new user ID
        return res.status(201).json({
            message: "User registered successfully",
            userId: newUser.id
        });
    },
};

// Export controller so it can be used in routes
module.exports = authController;
