const groupDao = require("../dao/groupdao");

const groupController = {

    // POST /create
    create: async (request, response) => {
        try {
            const user = request.user;
            const { name, description, membersEmail, thumbnail } = request.body;

            let allMembers = [user.email];
            if (membersEmail && Array.isArray(membersEmail)) {
                allMembers = [...new Set([...allMembers, ...membersEmail])];
            }

            const newGroup = await groupDao.createGroup({
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

            return response.status(201).json({
                message: "Group created",
                groupId: newGroup._id
            });

        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    // PUT /update
    update: async (request, response) => {
        try {
            const updatedGroup = await groupDao.updateGroup(request.body);

            if (!updatedGroup) {
                return response.status(404).json({ message: "Group not found" });
            }

            return response.status(200).json(updatedGroup);

        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Error updating group" });
        }
    },

    // PATCH /members/add
    addMembers: async (request, response) => {
        try {
            const { groupId, emails } = request.body;

            const updatedGroup = await groupDao.addMembers(groupId, ...emails);
            return response.status(200).json(updatedGroup);

        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Error adding members" });
        }
    },

    // PATCH /members/remove
    removeMembers: async (request, response) => {
        try {
            const { groupId, emails } = request.body;

            const updatedGroup = await groupDao.removeMembers(groupId, ...emails);
            return response.status(200).json(updatedGroup);

        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Error removing members" });
        }
    },

    // GET /my-groups
    getGroupsByUser: async (request, response) => {
        try {
            const email = request.user.email;

            const groups = await groupDao.getGroupByEmail(email);
            return response.status(200).json(groups);

        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Error fetching groups" });
        }
    },

    // GET /status?isPaid=true|false
    getGroupsByPaymentStatus: async (request, response) => {
        try {
            const { isPaid } = request.query;
            const status = isPaid === 'true';

           const email = request.user.email;
           const groups = await groupDao.getGroupByStatusAndEmail(email, status);
            return response.status(200).json(groups);

        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Error filtering groups" });
        }
    },

    // GET /:groupId/audit
    getAudit: async (request, response) => {
        try {
            const { groupId } = request.params;

            const lastSettled = await groupDao.getAuditLog(groupId);
            return response.status(200).json({ lastSettled });

        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Error fetching audit log" });
        }
    }
};

module.exports = groupController;
