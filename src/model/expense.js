const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
        index: true
    },
    paidBy: {
        type: String, // email of the user who paid
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    splits: [
        {
            memberEmail: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            }
        }
    ],
    excludedMembers: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
