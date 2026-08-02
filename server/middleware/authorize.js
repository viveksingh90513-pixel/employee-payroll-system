/**
 * PayRoll Pro – Role-Based Authorization Middleware
 * Restricts route access to specified user roles.
 * Must be used AFTER the authenticate middleware.
 */

/**
 * Creates a middleware that checks if the authenticated user
 * has one of the allowed roles.
 *
 * Usage in routes:
 *   router.get('/admin-only', authenticate, authorize('admin'), handler)
 *   router.get('/admin-hr', authenticate, authorize('admin', 'hr'), handler)
 *
 * @param  {...string} allowedRoles - Roles that can access this route ('admin', 'hr', 'employee')
 * @returns {import('express').RequestHandler}
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure the authenticate middleware has run and attached req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.',
      });
    }

    // Check if the user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = authorize;
