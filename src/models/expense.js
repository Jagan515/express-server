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
    category: {
        type: String,
        required: true,
        default: "Other"
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
        },
        isSettled: {
            type: Boolean,
            default: false
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
