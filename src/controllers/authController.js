const usersDao = require('../dao/userDao');
const bcrypt=require('bcryptjs'); // npm install bcryptjs

const authController = {

    // LOGIN FUNCTION
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and Password are required"
            });
        }

        const user = await usersDao.findByEmail(email);



        const isPasswordMatch=await bcrypt.compare(password,user.password);

        if (user && isPasswordMatch) {
            return res.status(200).json({
                message: "Login successful",
                userId: user._id
            });
        } else {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }
    },

    // REGISTER FUNCTION
    register: async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const userExists = await usersDao.findByEmail(email);

        if (userExists) {
            return res.status(409).json({
                error: "User already exists"
            });
        }


        const salt= await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);


        const newUser = await usersDao.create({
            username:username,
            email:email,
            password:hashedPassword
        });

        return res.status(201).json({
            message: "User registered successfully",
            userId: newUser._id
        });
    }
};

module.exports = authController;
