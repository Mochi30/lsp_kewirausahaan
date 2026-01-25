const express = require("express");
const prisma = require("../lib/db");
const { requireAuth, requireAdmin } = require("../lib/auth");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const schemes = await prisma.scheme.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return res.json(schemes);
  } catch (err) {
    return next(err);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, level, icon, description, competencies, order } = req.body || {};
    if (!title || !level) {
      return res.status(400).json({ error: "Judul dan level wajib." });
    }

    const scheme = await prisma.scheme.create({
      data: {
        title,
        level,
        icon: icon || null,
        description: description || null,
        competencies: Array.isArray(competencies) ? competencies : [],
        order: Number(order) || 0,
      },
    });
    return res.status(201).json(scheme);
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, level, icon, description, competencies, order } = req.body || {};
    const scheme = await prisma.scheme.update({
      where: { id },
      data: {
        title,
        level,
        icon,
        description,
        competencies: Array.isArray(competencies) ? competencies : undefined,
        order: typeof order === "undefined" ? undefined : Number(order) || 0,
      },
    });
    return res.json(scheme);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.scheme.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
