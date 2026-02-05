const permission = require('../utility/permissions');

const authorizeMiddleware = (requiredPermission) => {
  return (request, response, next) => {
    console.log('REQUIRED PERMISSION:', requiredPermission);
    console.log('USER OBJECT:', request.user);
    console.log('USER ROLE:', request.user?.role);
    console.log('ROLE PERMISSIONS:', permission[request.user?.role]);
    // AuthMiddleware must run before this middleware
    // so that we can have access to user object.
    const user = request.user;

    if (!user) {
      return response
        .status(401)
        .json({ message: 'Unauthorized access ' });
    }

    const userPermissions = permission[user.role] || [];

    if (!userPermissions.includes(requiredPermission)) {
      return response.status(403).json({
        message: 'Forbidden: Insufficient Permissions'
      });
    }

    next();
  };
};

module.exports = authorizeMiddleware;
