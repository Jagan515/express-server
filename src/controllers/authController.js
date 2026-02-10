const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
const { ADMIN_ROLE } = require('../utility/userRoles');
const emailService = require('../services/emailService');

const authController = {

    login: async (request, response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = request.body;

        try {
            const user = await userDao.findByEmail(email);
            if (!user) {
                return response.status(400).json({
                    message: 'Invalid email or password'
                });
            }

            // 🔹 Backward compatibility
            user.role = user.role ? user.role : ADMIN_ROLE;
            user.adminId = user.adminId ? user.adminId : user._id;

            const isPasswordMatched = await bcrypt.compare(password, user.password);
            if (!isPasswordMatched) {
                return response.status(400).json({
                    message: 'Invalid email or password'
                });
            }

            const token = jwt.sign(
                {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    adminId: user.adminId
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            response.cookie('jwtToken', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                path: '/'
            });

            return response.status(200).json({
                message: 'User authenticated',
                user: user
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    register: async (request, response) => {
        const { name, email, password } = request.body;

        if (!name || !email || !password) {
            return response.status(400).json({
                message: 'Name, Email, Password are required'
            });
        }

        try {
            const existingUser = await userDao.findByEmail(email);
            if (existingUser) {
                return response.status(400).json({
                    message: 'User with the email already exist'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await userDao.create({
                name: name,
                email: email,
                password: hashedPassword,
                role: ADMIN_ROLE,
                adminId: null
            });

            return response.status(200).json({
                message: 'User registered',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    isUserLoggedIn: async (request, response) => {
        try {
            const token = request.cookies?.jwtToken;

            if (!token) {
                return response.status(401).json({
                    message: 'Unauthorized access'
                });
            }

            jwt.verify(token, process.env.JWT_SECRET, (error, decodedUser) => {
                if (error) {
                    return response.status(401).json({
                        message: 'Invalid token'
                    });
                }

                return response.status(200).json({
                    user: decodedUser
                });
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    logout: async (request, response) => {
        try {
            response.clearCookie('jwtToken');
            return response.json({
                message: 'Logout successful'
            });
        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    googleSso: async (request, response) => {
        try {
            const { idToken } = request.body;

            if (!idToken) {
                return response.status(401).json({
                    message: 'Invalid request'
                });
            }

            const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const googleResponse = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = googleResponse.getPayload();
            const { sub: googleId, name, email } = payload;

            let user = await userDao.findByEmail(email);

            if (!user) {
                user = await userDao.create({
                    name: name,
                    email: email,
                    googleId: googleId,
                    role: ADMIN_ROLE,
                    adminId: null
                });
            }

            // 🔹 Backward compatibility
            user.role = user.role ? user.role : ADMIN_ROLE;
            user.adminId = user.adminId ? user.adminId : user._id;

            const token = jwt.sign(
                {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    adminId: user.adminId
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            response.cookie('jwtToken', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                path: '/'
            });

            return response.status(200).json({
                message: 'User authenticated',
                user: user
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    resetPassword: async (request, response) => {
        try {
            const { email } = request.body;

            if (!email) {
                return response.status(400).json({
                    message: 'Email is required'
                });
            }

            const user = await userDao.findByEmail(email);
            if (!user) {
                return response.status(404).json({
                    message: 'User not found'
                });
            }

            // 🔹 Backward compatibility
            user.role = user.role ? user.role : ADMIN_ROLE;
            user.adminId = user.adminId ? user.adminId : user._id;

            const now = Date.now();

            if (
                user.resetPasswordLastRequestedAt &&
                now - user.resetPasswordLastRequestedAt.getTime() < 2 * 60 * 1000
            ) {
                return response.status(429).json({
                    message: 'Please wait 2 minutes before requesting again'
                });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            user.resetOtp = otp;
            user.resetOtpExpiry = new Date(now + 10 * 60 * 1000);
            user.resetPasswordLastRequestedAt = new Date(now);

            await user.save();

            response.status(200).json({
                message: 'OTP sent to email'
            });

            emailService
                .send(email, 'Password Reset OTP', `Your OTP is ${otp}`)
                .catch(console.error);

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    changePassword: async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({
                    errors: errors.array()
                });
            }

            const { email, otp, newPassword } = request.body;

            const user = await userDao.findByEmail(email);
            if (!user) {
                return response.status(404).json({
                    message: 'User not found'
                });
            }

            // 🔹 Backward compatibility
            user.role = user.role ? user.role : ADMIN_ROLE;
            user.adminId = user.adminId ? user.adminId : user._id;

            if (
                !user.resetOtp ||
                !user.resetOtpExpiry ||
                String(user.resetOtp) !== String(otp) ||
                user.resetOtpExpiry.getTime() < Date.now()
            ) {
                return response.status(400).json({
                    message: 'Invalid or expired OTP'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedPassword;
            user.resetOtp = undefined;
            user.resetOtpExpiry = undefined;

            await user.save();

            return response.status(200).json({
                message: 'Password updated successfully'
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    }
};

module.exports = authController;
