const CREDIT_TO_PAISA_MAPPING = new Map([
  [10, 100],
  [50, 400],
  [100, 700],
]);

const PAISA_TO_CREDIT_MAPPING = new Map([
  [100, 10],
  [400, 50],
  [700, 100],
]);
const PLAN_IDS={
    UNLIMITED_MONTLY:{
        id:process.env.RAZORPAY_MONTHLYLY_PLAN_ID,
        name:"MergeMoney Unlimited Montly",
        totalBillCycleCount:12
    },
    UNLIMITED_YEARLY:{
        id:process.env.RAZORPAY_YEARLY_PLAN_ID,
        name:"MergeMoney Unlimited Yearly",
        totalBillCycleCount:5
    },
};

module.exports = {
  CREDIT_TO_PAISA_MAPPING,
  PAISA_TO_CREDIT_MAPPING,
  PLAN_IDS
};
