const { request } = require("express");
const profileDao = require("../dao/profileDao");
const jwt = require("jsonwebtoken");

const usersController = {
    getUserInfo: async (request, response) => {
        try {
            const email = request.user.email;
            const user = await profileDao.findByEmail(email);
            console.log("---- PROFILE API CALLED ----");
            console.log("User subscription from DB:", user.subscription);


            return response.json({ user });
        } catch (error) {
            console.error(error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },
    updateName: async (request, response) => {
        try {
            const { name } = request.body;

            if (!name || name.trim().length < 3) {
                return response.status(400).json({
                    message: "Name must be at least 3 characters",
                });
            }

            const email = request.user.email;

            const user = await profileDao.updateNameByEmail(
                email,
                name.trim()
            );

            if (!user) {
                return response.status(404).json({
                    message: "User not found",
                });
            }


            const token = jwt.sign(
                {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    adminId: user.adminId,
                },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            response.cookie("jwtToken", token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                path: "/",
            });

            return response.json({
                message: "Name updated successfully",
                user,
            });
        } catch (error) {
            console.error("Update name failed:", error);
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    },



}

module.exports = usersController;