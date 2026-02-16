const {ADMIN_ROLE,MANAGER_ROLE,VIEWER_ROLE} = require("./userRoles");

const permissions = {
    [ADMIN_ROLE]: [
        'users:create',
        'users:update',
        'users:delete',
        'users:view',
        'groups:create',
        'groups:update',
        'groups:delete',
        'groups:view',
        'payment:create',
        'profile:update',
        'payment:cancel'
    ],
    [MANAGER_ROLE]: [
        'users:view',
        'groups:create',
        'groups:update',
        'groups:view'
    ],
    [VIEWER_ROLE]: [
        'users:view',
        'groups:view'
    ]
};

module.exports = permissions;
