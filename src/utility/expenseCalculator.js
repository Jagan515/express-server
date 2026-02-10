
const calculateBalances = (expenses) => {
    const balances = {};

    expenses.forEach((expense) => {
        const { paidBy, amount, splits } = expense;

        // The payer initially gets credited with the full amount
        balances[paidBy] = (balances[paidBy] || 0) + amount;

        // Each split member owes their share
        splits.forEach((split) => {
    
            if (split.isSettled === true) return;

            balances[split.memberEmail] =
                (balances[split.memberEmail] || 0) - split.amount;
        });
    });

    return balances;
};

module.exports = {
    calculateBalances
};
