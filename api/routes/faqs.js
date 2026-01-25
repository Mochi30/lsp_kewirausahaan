const express = require("express");
const prisma = require("../lib/db");
const { requireAuth, requireAdmin } = require("../lib/auth");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return res.json(faqs);
  } catch (err) {
    return next(err);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { question, answer, order } = req.body || {};
    if (!question || !answer) {
      return res.status(400).json({ error: "Pertanyaan dan jawaban wajib." });
    }

    const faq = await prisma.faq.create({
      data: { question, answer, order: Number(order) || 0 },
    });
    return res.status(201).json(faq);
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { question, answer, order } = req.body || {};
    const faq = await prisma.faq.update({
      where: { id },
      data: {
        question,
        answer,
        order: typeof order === "undefined" ? undefined : Number(order) || 0,
      },
    });
    return res.json(faq);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.faq.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
