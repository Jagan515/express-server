const expenseDao = require('../dao/expenseDao');
const Group = require('../model/group');
const { calculateBalances } = require('../utility/expenseCalculator');

const expenseController = {

    // POST /expenses/add
    add: async (request, response) => {
        try {
            const user = request.user;
            const { groupId, amount, splits, excludedMembers = [] } = request.body;

            if (!groupId || !amount || !splits || !Array.isArray(splits)) {
                return response.status(400).json({
                    message: 'Invalid expense data'
                });
            }

            const expense = await expenseDao.create({
                groupId,
                paidBy: user.email,
                amount,
                splits,
                excludedMembers
            });

            return response.status(201).json({
                message: 'Expense added',
                expense
            });

        } catch (error) {
            console.log(error);
            response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    // GET /expenses/group/:groupId
    getByGroup: async (request, response) => {
        try {
            const { groupId } = request.params;

            const expenses = await expenseDao.getByGroupId(groupId);

            return response.status(200).json({
                expenses
            });

        } catch (error) {
            console.log(error);
            response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    // GET /expenses/group/:groupId/summary
    summary: async (request, response) => {
        try {
            const { groupId } = request.params;

            const expenses = await expenseDao.getByGroupId(groupId);
            const balances = calculateBalances(expenses);

            return response.status(200).json({
                balances
            });

        } catch (error) {
            console.log(error);
            response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    // POST /expenses/group/:groupId/settle
    settle: async (request, response) => {
        try {
            const { groupId } = request.params;

            await expenseDao.deleteByGroupId(groupId);

            await Group.findByIdAndUpdate(groupId, {
                paymentStatus: {
                    amount: 0,
                    currency: 'INR',
                    date: Date.now(),
                    isPaid: true
                }
            });

            return response.status(200).json({
                message: 'Group settled successfully'
            });

        } catch (error) {
            console.log(error);
            response.status(500).json({
                message: 'Internal server error'
            });
        }
    }
};

module.exports = expenseController;
