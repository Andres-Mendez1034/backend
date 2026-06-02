import { checkRole } from "./roles.middleware.js";

const isAdmin = checkRole(["superadmin"]);

export default isAdmin;