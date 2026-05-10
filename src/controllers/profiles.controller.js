import db from "../config/db.js";

/* =========================================================
   CREAR / ACTUALIZAR INFLUENCER PROFILE (UPSERT + VALIDACIÓN)
========================================================= */
export const createInfluencerProfile = async (req, res) => {
  try {
    const {
      user_id,
      full_name,
      id_number,
      location,
      tiktok_url,
      tags = []
    } = req.body;

    if (!user_id || !full_name || !id_number) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔥 VALIDACIÓN ANTES DEL UPSERT (evita error id_number duplicado)
    const idCheck = await db.query(
      `SELECT user_id FROM influencer_profiles WHERE id_number = $1`,
      [id_number]
    );

    if (
      idCheck.rows.length > 0 &&
      idCheck.rows[0].user_id !== user_id
    ) {
      return res.status(409).json({
        error: "id_number already used by another user"
      });
    }

    // 🔥 UPSERT por user_id
    const result = await db.query(
      `INSERT INTO influencer_profiles
      (user_id, full_name, id_number, category, location, tiktok_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        id_number = EXCLUDED.id_number,
        location = EXCLUDED.location,
        tiktok_url = EXCLUDED.tiktok_url
      RETURNING *`,
      [
        user_id,
        full_name,
        id_number,
        "influencer",
        location,
        tiktok_url
      ]
    );

    const profile = result.rows[0];

    // 🔥 reset tags (evita duplicados)
    await db.query(
      `DELETE FROM profile_tags WHERE profile_id = $1`,
      [profile.profile_id]
    );

    // 🔥 insert tags
    if (tags.length > 0) {
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

    return res.status(200).json({
      message: "Influencer profile saved",
      profile
    });

  } catch (err) {
    console.error("INFLUENCER PROFILE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};


/* =========================================================
   CREAR / ACTUALIZAR CLIENT PROFILE (UPSERT)
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
      ON CONFLICT (user_id)
      DO UPDATE SET
        business_name = EXCLUDED.business_name,
        owner_name = EXCLUDED.owner_name,
        business_type = EXCLUDED.business_type,
        location = EXCLUDED.location,
        awareness_level = EXCLUDED.awareness_level,
        main_goal = EXCLUDED.main_goal
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

    return res.status(200).json({
      message: "Client profile saved",
      profile: result.rows[0]
    });

  } catch (err) {
    console.error("CLIENT PROFILE ERROR:", err);
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
   UPDATE INFLUENCER PROFILE (SEGURO)
========================================================= */

const ALLOWED_FIELDS = [
  "full_name",
  "id_number",
  "location",
  "tiktok_url"
];

export const updateInfluencerProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const updates = req.body;

    const keys = Object.keys(updates).filter(k =>
      ALLOWED_FIELDS.includes(k)
    );

    if (keys.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const values = keys.map(k => updates[k]);

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