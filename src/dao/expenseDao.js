const Expense = require('../models/expense');

const expenseDao = {

   create: async (expenseData) => {
    return await Expense.create({
        groupId: expenseData.groupId,
        paidBy: expenseData.paidBy,
        amount: expenseData.amount,
        category: expenseData.category || "Other",
        splits: expenseData.splits,
        excludedMembers: expenseData.excludedMembers || []
    });
},

    getByGroupId: async (groupId) => {
        return await Expense.find({ groupId });
    },

    deleteByGroupId: async (groupId) => {
        return await Expense.deleteMany({ groupId });
    },

    
    markMemberSettled: async (groupId, memberEmail) => {
        return await Expense.updateMany(
            {
                groupId,
                "splits.memberEmail": memberEmail
            },
            {
                $set: {
                    "splits.$.isSettled": true
                }
            }
        );
    },


    unmarkMemberSettled: async (groupId, memberEmail) => {
        return await Expense.updateMany(
            {
                groupId,
                "splits.memberEmail": memberEmail
            },
            {
                $set: {
                    "splits.$.isSettled": false
                }
            }
        );
    },


    updateSplits: async (groupId, splits) => {
        return await Expense.updateMany(
            { groupId },
            { $set: { splits } }
        );
    }
};

module.exports = expenseDao;
