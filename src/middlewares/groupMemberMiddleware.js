const mongoose = require('mongoose');
const Group = require('../models/group');

const groupMemberMiddleware = async (request, response, next) => {
    try {
        const { groupId } = request.body;
        const userEmail = request.user.email;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return response.status(400).json({
                message: 'Invalid groupId'
            });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return response.status(404).json({
                message: 'Group not found'
            });
        }

        if (!group.membersEmail.includes(userEmail)) {
            return response.status(403).json({
                message: 'You are not a member of this group'
            });
        }

        next();
    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = groupMemberMiddleware;
