const groupDao = require("../dao/groupdao");

const groupController = {
    create: async (request, response) => {
        try {
            const user = request.user;

            const {
                name,
                description,
                membersEmail,
                thumbnail
            } = request.body;

            let allMembers = [user.email];

            if (membersEmail && Array.isArray(membersEmail)) {
                allMembers = [...new Set([...allMembers, ...membersEmail])];
            }

            const newGroup = await groupDao.createdGroup({
                name,
                description,
                adminEmail: user.email,
                membersEmail: allMembers,
                thumbnail,
                paymentStatus: {
                    amount: 0,
                    currency: 'INR',
                    date: Date.now(),
                    isPaid: false
                }
            });

            return response.status(200).json({
                message: 'Group created',
                groupId: newGroup._id
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: "Internal server error"
            });
        }
    }
};

module.exports = groupController;
