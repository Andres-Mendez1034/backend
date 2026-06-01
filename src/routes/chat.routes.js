// routes/chat.routes.js
import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import db from "../config/db.js";

const router = Router();

// ── GET /api/chat/conversations
router.get("/conversations", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await db.query(
      `SELECT
        c.id,
        c.client_id,
        c.creator_id,
        c.updated_at,
        CASE WHEN c.client_id = $1 THEN pu.name ELSE pc.name END  AS other_name,
        NULL AS other_avatar,
        CASE WHEN c.client_id = $1 THEN c.creator_id ELSE c.client_id END AS other_id,
        lm.text        AS last_message,
        lm.created_at  AS last_message_at,
        (SELECT COUNT(*) FROM messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id <> $1
            AND m.read_at IS NULL) AS unread_count
      FROM conversations c
      JOIN users pc ON pc.id = c.client_id
      -- creator_id es el id de creator_profiles, no users
      JOIN creator_profiles cp ON cp.id = c.creator_id
      JOIN users pu ON pu.id = cp.user_id
      LEFT JOIN LATERAL (
        SELECT text, created_at FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC LIMIT 1
      ) lm ON true
      WHERE c.client_id = $1
         OR cp.user_id  = $1
      ORDER BY c.updated_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar conversaciones" });
  }
});

// ── POST /api/chat/conversations
router.post("/conversations", auth, async (req, res) => {
  const clientId = req.user.id;
  const { creator_id } = req.body;
  if (!creator_id) return res.status(400).json({ error: "creator_id requerido" });

  try {
    const { rows } = await db.query(
      `INSERT INTO conversations (client_id, creator_id)
       VALUES ($1, $2)
       ON CONFLICT (client_id, creator_id) DO UPDATE SET updated_at = now()
       RETURNING *`,
      [clientId, creator_id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear conversación" });
  }
});

// ── GET /api/chat/conversations/:id/messages
router.get("/conversations/:id/messages", auth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    await db.query(
      `UPDATE messages SET read_at = now()
       WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL`,
      [id, userId]
    );
    const { rows } = await db.query(
      `SELECT m.*, u.name AS sender_name, NULL AS sender_avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar mensajes" });
  }
});

// ── POST /api/chat/conversations/:id/messages
router.post("/conversations/:id/messages", auth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { text, is_offer = false, offer_amount = null } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "Texto requerido" });

  try {
    const { rows } = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, text, is_offer, offer_amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, userId, text.trim(), is_offer, offer_amount]
    );
    // Actualizar updated_at de la conversación para que aparezca primero en el sidebar
    await db.query(
      `UPDATE conversations SET updated_at = now() WHERE id = $1`,
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
});

// ── GET /api/chat/unread-count
router.get("/unread-count", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*) AS total FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       LEFT JOIN creator_profiles cp ON cp.id = c.creator_id
       WHERE (c.client_id = $1 OR cp.user_id = $1)
         AND m.sender_id <> $1
         AND m.read_at IS NULL`,
      [userId]
    );
    res.json({ unread: parseInt(rows[0].total, 10) });
  } catch (err) {
    res.status(500).json({ error: "Error" });
  }
});

export default router;