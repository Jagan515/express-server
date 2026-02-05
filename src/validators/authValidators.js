const { body, validationResult } = require('express-validator');

const loginRules = [
    body('email').notEmpty().isEmail(),
    body('password').notEmpty().isLength({ min: 3 })
];

const resetPasswordRules = [
    body('email').notEmpty().isEmail(),
    body('otp').notEmpty().isNumeric().isLength({ min: 6, max: 6 }),
    body('newPassword').notEmpty().isLength({ min: 3 })
];

const loginValidator = async (req, res, next) => {
    for (const rule of loginRules) {
        await rule.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const resetPasswordValidator = async (req, res, next) => {
    for (const rule of resetPasswordRules) {
        await rule.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    loginValidator,
    resetPasswordValidator
};
