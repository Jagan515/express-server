const usersDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {

    // LOGIN FUNCTION
    login: async (request, response) => {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                error: "Email and Password are required"
            });
        }

        const user = await usersDao.findByEmail(email);

        if (!user) {
            return response.status(401).json({
                error: "Invalid credentials"
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return response.status(401).json({
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        response.cookie('jwtToken', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        });

        return response.status(200).json({
            message: "Login successful",
            user: user
        });
    },

    // REGISTER FUNCTION
    register: async (request, response) => {
        const { name, email, password } = request.body;

        if (!name || !email || !password) {
            return response.status(400).json({
                error: "All fields are required"
            });
        }

        const userExists = await usersDao.findByEmail(email);

        if (userExists) {
            return response.status(409).json({
                error: "User already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await usersDao.create({
            name,
            email,
            password: hashedPassword
        });

        return response.status(201).json({
        message: "User registered successfully",
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        }
        });

    },

    // CHECK LOGIN
    isUserLoggedIn: async (request, response) => {
        try {
            const token = request.cookies?.jwtToken;
            if (!token) {
                return response.status(401).json({ message: "Not authenticated" });
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return response.status(401).json({ message: "Invalid token" });
                }

                return response.status(200).json({
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    }
                });
            });
        } catch (err) {
            console.log("Error in isUserLoggedIn:", err);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    // LOGOUT
    logout: async (request, response) => {
        try {
            response.clearCookie('jwtToken');
            return response.json({ message: 'Logout successful' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Logout failed" });
        }
    }
};

module.exports = authController;
