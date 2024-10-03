const AuthenticationService = require("../services/authenticationService");

exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader);

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);

    try {
      const user = AuthenticationService.verifyJWT(token);
      console.log("Verified User:", user);
      req.user = user;
      next();
    } catch (error) {
      console.log("Token verification failed:", error);
      return res.status(403).json({ error: "Invalid token" });
    }
  } else {
    console.log("Authorization header missing");
    res.status(401).json({ error: "Authorization header missing" });
  }
};

exports.authorizeRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      await AuthenticationService.checkAuthorization(
        req.user.userId,
        requiredRole
      );
      next();
    } catch (error) {
      res.status(403).json({ error: "Unauthorized access" });
    }
  };
};
