const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/db");
const { signToken, requireAuth, requireAdmin } = require("../lib/auth");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Login gagal." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Login gagal." });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

router.post("/bootstrap", async (req, res, next) => {
  try {
    const token = req.headers["x-bootstrap-token"];
    if (!process.env.BOOTSTRAP_TOKEN || token !== process.env.BOOTSTRAP_TOKEN) {
      return res.status(403).json({ error: "Invalid bootstrap token." });
    }

    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib." });
    }

    const count = await prisma.user.count();
    if (count > 0) {
      return res.status(409).json({ error: "User sudah ada." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || "Admin",
        passwordHash,
        role: "admin",
      },
    });

    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/users", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email,
        passwordHash,
        role: role || "admin",
      },
    });

    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email sudah terdaftar." });
    }
    return next(err);
  }
});

module.exports = router;
