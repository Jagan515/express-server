const groupDao = require("../dao/groupDao");
const userDao = require("../dao/userDao");


const groupController = {

    // POST /create
    create: async (request, response) => {
        try {
            const user = request.user;
            const { name, description, membersEmail, thumbnail } = request.body;

            const userInfo = await userDao.findByEmail(user.email);

            if (userInfo.credits === undefined) {
                userInfo.credits = 1;
            }

            if (userInfo.credits === 0) {
                return response.status(400).json({
                    message: 'You do not have enough credits to perform this operation'
                });
            }

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
                    currency: "INR",
                    date: Date.now(),
                    isPaid: false
                }
            });

            userInfo.credits -= 1;
            await userInfo.save();

            return response.status(201).json({
                message: "Group created successfully",
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
            if (!request.body._id) {
                return response.status(400).json({ message: "Group ID required" });
            }

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

            if (!Array.isArray(emails)) {
                return response.status(400).json({ message: "emails must be an array" });
            }

            const updatedGroup = await groupDao.addMembers(groupId, emails);
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

            if (!Array.isArray(emails)) {
                return response.status(400).json({ message: "emails must be an array" });
            }

            const updatedGroup = await groupDao.removeMembers(groupId, emails);
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

            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 10;
            const skip = (page - 1) * limit;

            const sortBy = request.query.sortBy || "newest";

            // ⚠️ MUST match schema field name
            let sortOptions = { createdAt: -1 };
            if (sortBy === "oldest") {
                sortOptions = { createdAt: 1 };
            }

            const { groups, totalCount } =
                await groupDao.getGroupPaginated(email, limit, skip, sortOptions);

            return response.status(200).json({
                groups,
                pagination: {
                    totalItems: totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    currentPage: page,
                    itemsPerPage: limit
                }
            });

        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Error fetching groups" });
        }
    },

    // GET /status?isPaid=true|false
    getGroupsByPaymentStatus: async (request, response) => {
        try {
            const status = request.query.isPaid === "true";
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
