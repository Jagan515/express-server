const Expense = require('../model/expense');

const expenseDao = {
    create: async (expenseData) => {
        return await Expense.create({
            groupId: expenseData.groupId,
            paidBy: expenseData.paidBy,
            amount: expenseData.amount,
            splits: expenseData.splits,
            excludedMembers: expenseData.excludedMembers || []
        });
    },

    getByGroupId: async (groupId) => {
        return await Expense.find({ groupId });
    },

    deleteByGroupId: async (groupId) => {
        return await Expense.deleteMany({ groupId });
    }
};

module.exports = expenseDao;
