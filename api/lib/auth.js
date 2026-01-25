const jwt = require("jsonwebtoken");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }
  return process.env.JWT_SECRET;
}

function signToken(user) {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || "12h";
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role || "admin" },
    secret,
    { expiresIn }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
}

module.exports = { signToken, requireAuth, requireAdmin };
