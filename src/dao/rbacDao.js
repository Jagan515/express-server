const User = require("../model/User");
const { generateTemporaryPassword } = require("../utility/passwordUtil");

const rbacDao = {
    create: async (userData) => {
        const password = generateTemporaryPassword(8);

        return await User.create({
            email: userData.email,
            password: password,
            name: userData.name,
            role: userData.role,
            adminId: userData._id
        });
    },

    update: async (userId, name, role) => {
        return await User.findByIdAndUpdate(
            userId,
            { name, role },
            { new: true }
        );
    },

    delete: async (userId) => {
        return await User.findByIdAndDelete(userId);
    },

    getUsersByAdminId: async (adminId) => {
        return await User.find({ adminId }).select("-password");
    }
};

module.exports = rbacDao;
