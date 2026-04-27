import db from "../config/db.js";

/* =========================================================
   CREAR INFLUENCER PROFILE + TAGS + TIKTOK
========================================================= */
export const createInfluencerProfile = async (req, res) => {
  try {
    const {
      user_id,
      full_name,
      id_number,
      location,
      tiktok_url, // 🔥 NUEVO
      tags = []
    } = req.body;

    if (!user_id || !full_name || !id_number) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Crear perfil (FIX: category eliminado)
    const result = await db.query(
      `INSERT INTO influencer_profiles
      (user_id, full_name, id_number, category, location, tiktok_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        user_id,
        full_name,
        id_number,
        "influencer", // 🔥 fijo (no se selecciona desde frontend)
        location,
        tiktok_url
      ]
    );

    const profile = result.rows[0];

    // 2. Insertar tags (INTERESES)
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagResult = await db.query(
          `SELECT tag_id FROM tags WHERE tag_name = $1`,
          [tagName]
        );

        if (tagResult.rows.length > 0) {
          await db.query(
            `INSERT INTO profile_tags (profile_id, tag_id)
             VALUES ($1, $2)`,
            [profile.profile_id, tagResult.rows[0].tag_id]
          );
        }
      }
    }

    return res.status(201).json({
      message: "Influencer profile created",
      profile
    });

  } catch (err) {
    console.error("CREATE INFLUENCER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};


/* =========================================================
   CREAR CLIENT PROFILE
========================================================= */
export const createClientProfile = async (req, res) => {
  try {
    const {
      user_id,
      business_name,
      owner_name,
      business_type,
      location,
      awareness_level,
      main_goal
    } = req.body;

    if (!user_id || !business_name || !owner_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await db.query(
      `INSERT INTO client_profiles
      (user_id, business_name, owner_name, business_type, location, awareness_level, main_goal)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        user_id,
        business_name,
        owner_name,
        business_type,
        location,
        awareness_level,
        main_goal
      ]
    );

    return res.status(201).json({
      message: "Client profile created",
      profile: result.rows[0]
    });

  } catch (err) {
    console.error("CREATE CLIENT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};


/* =========================================================
   OBTENER PERFIL POR USER
========================================================= */
export const getProfileByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const influencer = await db.query(
      `SELECT * FROM influencer_profiles WHERE user_id = $1`,
      [user_id]
    );

    const client = await db.query(
      `SELECT * FROM client_profiles WHERE user_id = $1`,
      [user_id]
    );

    return res.json({
      influencer: influencer.rows[0] || null,
      client: client.rows[0] || null
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


/* =========================================================
   UPDATE INFLUENCER PROFILE
========================================================= */
export const updateInfluencerProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const updates = req.body;

    const keys = Object.keys(updates);
    const values = Object.values(updates);

    if (keys.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const setQuery = keys
      .map((key, i) => `${key} = $${i + 2}`)
      .join(", ");

    const result = await db.query(
      `UPDATE influencer_profiles
       SET ${setQuery}
       WHERE user_id = $1
       RETURNING *`,
      [user_id, ...values]
    );

    return res.json({
      message: "Profile updated",
      profile: result.rows[0]
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};