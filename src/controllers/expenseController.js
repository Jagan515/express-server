const expenseDao = require('../dao/expenseDao');
const Group = require('../models/group');
const { calculateBalances } = require('../utility/expenseCalculator');

const expenseController = {

    // POST /expenses/add
    add: async (request, response) => {
        try {
            const user = request.user;
            const { groupId, amount, splits, excludedMembers = [], category } = request.body;

            if (!groupId || !amount || !splits || !Array.isArray(splits)) {
                return response.status(400).json({
                    message: 'Invalid expense data'
                });
            }

            const expense = await expenseDao.create({
                groupId,
                paidBy: user.email,
                amount,
                category,
                splits,
                excludedMembers
            });

            return response.status(201).json({
                message: 'Expense added',
                expense
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    // GET /expenses/group/:groupId
    getByGroup: async (request, response) => {
        try {
            const { groupId } = request.params;

            if (!groupId) {
                return response.status(400).json({
                    message: 'Group ID is required'
                });
            }

            const group = await Group.findById(groupId);
            if (!group) {
                return response.status(404).json({
                    message: 'Group not found'
                });
            }

            const expenses = await expenseDao.getByGroupId(groupId);
            const summary = calculateBalances(expenses);

            return response.status(200).json({
                group,
                expenses,
                summary
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    // GET /expenses/group/:groupId/summary
    summary: async (request, response) => {
        try {
            const { groupId } = request.params;

            if (!groupId) {
                return response.status(400).json({
                    message: 'Group ID is required'
                });
            }

            const expenses = await expenseDao.getByGroupId(groupId);
            const balances = calculateBalances(expenses);

            return response.status(200).json({
                balances
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    // POST /expenses/group/:groupId/settle
    settle: async (request, response) => {
        try {
            const { groupId } = request.params;

            if (!groupId) {
                return response.status(400).json({
                    message: 'Group ID is required'
                });
            }

            const group = await Group.findById(groupId);
            if (!group) {
                return response.status(404).json({
                    message: 'Group not found'
                });
            }

            await expenseDao.deleteByGroupId(groupId);

            group.paymentStatus = {
                amount: 0,
                currency: 'INR',
                date: Date.now(),
                isPaid: true
            };

            await group.save();

            return response.status(200).json({
                message: 'Group settled successfully'
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    // NEW: POST /expenses/group/:groupId/settle/member
    settleMember: async (request, response) => {
        try {
            const { groupId } = request.params;
            const { memberEmail } = request.body;

            if (!groupId || !memberEmail) {
                return response.status(400).json({
                    message: 'Group ID and member email are required'
                });
            }

            await expenseDao.markMemberSettled(groupId, memberEmail);

            return response.status(200).json({
                message: 'Member marked as settled'
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    // NEW: POST /expenses/group/:groupId/unsettle/member
    unsettleMember: async (request, response) => {
        try {
            const { groupId } = request.params;
            const { memberEmail } = request.body;

            if (!groupId || !memberEmail) {
                return response.status(400).json({
                    message: 'Group ID and member email are required'
                });
            }

            await expenseDao.unmarkMemberSettled(groupId, memberEmail);

            return response.status(200).json({
                message: 'Member settlement reverted'
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    // NEW: PATCH /expenses/group/:groupId/splits
    updateSplits: async (request, response) => {
        try {
            const { groupId } = request.params;
            const { splits } = request.body;

            if (!groupId || !Array.isArray(splits)) {
                return response.status(400).json({
                    message: 'Group ID and valid splits are required'
                });
            }

            await expenseDao.updateSplits(groupId, splits);

            return response.status(200).json({
                message: 'Expense splits updated successfully'
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    }
};

module.exports = expenseController;
