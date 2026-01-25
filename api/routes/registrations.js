const express = require("express");
const prisma = require("../lib/db");
const { requireAuth, requireAdmin } = require("../lib/auth");

const router = express.Router();

router.get("/", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(registrations);
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, email, wa, schemeId, schemeTitle, notes } = req.body || {};
    if (!name || !email || !wa || (!schemeId && !schemeTitle)) {
      return res.status(400).json({ error: "Data pendaftaran tidak lengkap." });
    }

    const registration = await prisma.registration.create({
      data: {
        name,
        email,
        wa,
        schemeId: schemeId ? Number(schemeId) : null,
        schemeTitle: schemeTitle || null,
        notes: notes || null,
        status: "new",
      },
    });

    return res.status(201).json(registration);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
