const User = require("../models/User");

const profileDao = {
    findByEmail: async (email) => {
        return await User.findOne({ email });
    },

    updateNameByEmail: async (email, name) => {
        return await User.findOneAndUpdate(
            { email },
            { name },
            { new: true } // return updated user
        );
    },
};

module.exports = profileDao;
