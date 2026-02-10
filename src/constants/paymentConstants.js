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

module.exports = {
  CREDIT_TO_PAISA_MAPPING,
  PAISA_TO_CREDIT_MAPPING,
};
