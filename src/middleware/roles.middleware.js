export const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // ==========================
      // VALIDACIÓN DE USER
      // ==========================
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          error: "Unauthorized: user not found in request"
        });
      }

      // ==========================
      // VALIDACIÓN DE ROLE EXISTENTE
      // ==========================
      if (!user.role) {
        return res.status(403).json({
          error: "Forbidden: user has no role assigned"
        });
      }

      // ==========================
      // VALIDACIÓN DE PERMISOS
      // ==========================
      const isAllowed = allowedRoles.includes(user.role);

      if (!isAllowed) {
        return res.status(403).json({
          error: "Forbidden: insufficient permissions",
          required: allowedRoles,
          current: user.role
        });
      }

      next();

    } catch (err) {
      console.error("ROLE MIDDLEWARE ERROR:", err);

      return res.status(500).json({
        error: "Role middleware internal error"
      });
    }
  };
};