import db from "../config/db.js";

/* =========================================================
   CREAR / ACTUALIZAR INFLUENCER PROFILE (UPSERT)
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

    const idCheck = await db.query(
      `SELECT user_id FROM influencer_profiles WHERE id_number = $1`,
      [id_number]
    );

    if (idCheck.rows.length > 0 && idCheck.rows[0].user_id !== user_id) {
      return res.status(409).json({
        error: "id_number already used by another user"
      });
    }

    const result = await db.query(
      `INSERT INTO influencer_profiles
      (user_id, full_name, id_number, location, tiktok_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET
        full_name  = EXCLUDED.full_name,
        id_number  = EXCLUDED.id_number,
        location   = EXCLUDED.location,
        tiktok_url = EXCLUDED.tiktok_url
      RETURNING *`,
      [user_id, full_name, id_number, location, tiktok_url]
    );

    const profile = result.rows[0];

    await db.query(
      `DELETE FROM profile_tags WHERE profile_id = $1`,
      [profile.profile_id]
    );

    if (tags.length > 0) {
      for (const tagName of tags) {
        const tagResult = await db.query(
          `SELECT tag_id FROM tags WHERE tag_name = $1`,
          [tagName]
        );

        if (tagResult.rows.length > 0) {
          await db.query(
            `INSERT INTO profile_tags (profile_id, tag_id) VALUES ($1, $2)`,
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
   CREATOR PROFILE (COMPLETO CON MARKETPLACE INSERT)
========================================================= */
export const createCreatorProfile = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);
    console.log("FILE RECEIVED:", req.file);

    const {
      user_id,
      full_name,
      age,
      gender,
      bio,
      main_category,
      collaboration_goal,
      location,
      tiktok_url,
      instagram_url,
      youtube_url,
      followers,
      engagement_rate,
    } = req.body;

    if (!user_id || !full_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let profile_image = null;
    if (req.file) {
      profile_image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const result = await db.query(
      `INSERT INTO creator_profiles
      (
        user_id, full_name, age, gender, bio,
        main_category, collaboration_goal, location,
        tiktok_url, instagram_url, youtube_url,
        profile_image, followers, engagement_rate
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (user_id)
      DO UPDATE SET
        full_name          = EXCLUDED.full_name,
        age                = EXCLUDED.age,
        gender             = EXCLUDED.gender,
        bio                = EXCLUDED.bio,
        main_category      = EXCLUDED.main_category,
        collaboration_goal = EXCLUDED.collaboration_goal,
        location           = EXCLUDED.location,
        tiktok_url         = EXCLUDED.tiktok_url,
        instagram_url      = EXCLUDED.instagram_url,
        youtube_url        = EXCLUDED.youtube_url,
        profile_image      = EXCLUDED.profile_image,
        followers          = EXCLUDED.followers,
        engagement_rate    = EXCLUDED.engagement_rate,
        updated_at         = NOW()
      RETURNING *`,
      [
        user_id, full_name, age || null, gender || null, bio || null,
        main_category || null, collaboration_goal || null, location || null,
        tiktok_url || null, instagram_url || null, youtube_url || null,
        profile_image, followers || 0, engagement_rate || 0
      ]
    );

    const profile = result.rows[0];

    await db.query(
      `INSERT INTO influencer_services
        (user_id, influencer_name, category, price, is_trending, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id)
       DO UPDATE SET
         influencer_name = EXCLUDED.influencer_name,
         category        = EXCLUDED.category`,
      [
        user_id,
        full_name,
        main_category || null,
        0,
        false,
        "available"
      ]
    );

    return res.status(201).json({
      message: "Creator profile saved",
      profile
    });

  } catch (err) {
    console.error("CREATOR PROFILE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};


/* =========================================================
   CREAR CLIENT PROFILE (UPSERT)
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
        business_name   = EXCLUDED.business_name,
        owner_name      = EXCLUDED.owner_name,
        business_type   = EXCLUDED.business_type,
        location        = EXCLUDED.location,
        awareness_level = EXCLUDED.awareness_level,
        main_goal       = EXCLUDED.main_goal
      RETURNING *`,
      [
        user_id, business_name, owner_name,
        business_type, location, awareness_level, main_goal
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
   GET PROFILE BY USER
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
      client:     client.rows[0]     || null
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


/* =========================================================
   UPDATE INFLUENCER PROFILE
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
    const setQuery = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");

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


/* =========================================================
   GET CREATOR BY SERVICE_ID  ← NUEVO
   El marketplace navega a /creator/:id usando service_id
   de influencer_services. Este endpoint hace el JOIN con
   creator_profiles para devolver todos los datos del perfil.
========================================================= */
export const getCreatorById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT
         cp.user_id,
         cp.full_name,
         cp.age,
         cp.gender,
         cp.bio,
         cp.main_category,
         cp.collaboration_goal,
         cp.location,
         cp.tiktok_url,
         cp.instagram_url,
         cp.youtube_url,
         cp.profile_image,
         cp.followers,
         cp.engagement_rate,
         cp.updated_at,
         s.service_id,
         s.price,
         s.status,
         s.is_trending
       FROM influencer_services s
       JOIN creator_profiles cp ON cp.user_id = s.user_id
       WHERE s.service_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Creator not found" });
    }

    const row = result.rows[0];

    // Construimos el objeto con la forma que espera el frontend
    const profile = {
      id:         row.service_id,
      user_id:    row.user_id,
      name:       row.full_name,
      age:        row.age,
      gender:     row.gender,
      bio:        row.bio,
      avatar:     row.profile_image,
      location:   row.location,
      tags:       row.main_category ? [row.main_category] : [],
      willing:    row.collaboration_goal ? [row.collaboration_goal] : [],
      socials: {
        instagram: row.instagram_url  || null,
        tiktok:    row.tiktok_url     || null,
        youtube:   row.youtube_url    || null,
      },
      stats: {
        followers:   row.followers      ? Number(row.followers)      : null,
        engagement:  row.engagement_rate ? Number(row.engagement_rate) : null,
        avgLikes:    null,
        avgComments: null,
        reach:       null,
        platforms:   [],
      },
      price:      row.price,
      status:     row.status,
      trending:   row.is_trending,
    };

    return res.status(200).json({ profile });

  } catch (err) {
    console.error("GET CREATOR BY ID ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};