const Group = require('../models/group');

const groupDao = {

    createGroup: async (data) => {
        const newGroup = new Group(data);
        return await newGroup.save();
    },

    updateGroup: async (data) => {
        const { _id, name, description, thumbnail, adminEmail, paymentStatus } = data;

        return await Group.findByIdAndUpdate(
            _id,   // ✅ FIX: use _id
            { name, description, thumbnail, adminEmail, paymentStatus },
            { new: true }
        );
    },

    addMembers: async (groupId, membersEmail) => {
        return await Group.findByIdAndUpdate(
            groupId,
            { $addToSet: { membersEmail: { $each: membersEmail } } },
            { new: true }
        );
    },

    removeMembers: async (groupId, membersEmail) => {
        return await Group.findByIdAndUpdate(
            groupId,
            { $pull: { membersEmail: { $in: membersEmail } } },
            { new: true }
        );
    },

    getGroupByEmail: async (email) => {
        return await Group.find({ membersEmail: email });
    },

    getGroupByStatusAndEmail: async (email, status) => {
        return await Group.find({
            membersEmail: email,
            "paymentStatus.isPaid": status
        });
    },

    /**
     * Returns audit/settlement information
     */
    getAuditLog: async (groupId) => {
        return await Group.findById(groupId).select({
            paymentStatus: 1,
            _id: 0
        });
    },

    getGroupPaginated: async (
        email,
        limit,
        skip,
        sortOptions = { createdAt: -1 }
    ) => {
        const [groups, totalCount] = await Promise.all([
            Group.find({ membersEmail: email })
                .sort(sortOptions)
                .skip(skip)
                .limit(limit),
            Group.countDocuments({ membersEmail: email }),
        ]);

        return { groups, totalCount };
    },
};

module.exports = groupDao;
