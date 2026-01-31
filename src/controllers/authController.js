const usersDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

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
    if (user.googleId && !user.password) {
    return response.status(403).json({
      error: "Please login using Google"
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
            id: user.userId,
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
  },

  // GOOGLE SSO
  googleSso: async (req, res) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(401).json({
          message: 'invalid request from google sso'
        });
      }

      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      const googleResponse = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = googleResponse.getPayload();
      const { sub: googleId, name, email } = payload;

      let user = await usersDao.findByEmail(email);

      if (!user) {
        user = await usersDao.create({
          name,
          email,
          googleId
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          name: user.name,
          googleId: user.googleId,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('jwtToken', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });

      return res.status(200).json({
        message: 'Google login successful',
        user
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  }
};

module.exports = authController;
