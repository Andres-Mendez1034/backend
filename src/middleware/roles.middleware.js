export const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // El usuario debe venir del auth middleware
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          error: "Unauthorized: no user found in request"
        });
      }

      // role requerido no permitido
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: `Forbidden: role '${user.role}' not allowed`
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        error: "Role middleware error",
        details: err.message
      });
    }
  };
};