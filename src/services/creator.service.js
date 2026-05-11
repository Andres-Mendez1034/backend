import db from "../config/db.js";

// =========================================================
// CREATE CREATOR PROFILE (ONBOARDING COMERCIAL)
// =========================================================
export const createCreatorProfile = async (data) => {
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
    profile_image,
    banner_image,
    followers,
    engagement_rate
  } = data;

  const result = await db.query(
    `
    INSERT INTO creator_profiles
    (
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
      profile_image,
      banner_image,
      followers,
      engagement_rate
    )
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    ON CONFLICT (user_id)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      age = EXCLUDED.age,
      gender = EXCLUDED.gender,
      bio = EXCLUDED.bio,
      main_category = EXCLUDED.main_category,
      collaboration_goal = EXCLUDED.collaboration_goal,
      location = EXCLUDED.location,
      tiktok_url = EXCLUDED.tiktok_url,
      instagram_url = EXCLUDED.instagram_url,
      youtube_url = EXCLUDED.youtube_url,
      profile_image = EXCLUDED.profile_image,
      banner_image = EXCLUDED.banner_image,
      followers = EXCLUDED.followers,
      engagement_rate = EXCLUDED.engagement_rate,
      updated_at = NOW()
    RETURNING *;
    `,
    [
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
      profile_image,
      banner_image,
      followers,
      engagement_rate
    ]
  );

  return result.rows[0];
};

// =========================================================
// GET CREATOR PROFILE BY USER
// =========================================================
export const getCreatorProfileByUser = async (user_id) => {
  const result = await db.query(
    `
    SELECT *
    FROM creator_profiles
    WHERE user_id = $1
    `,
    [user_id]
  );

  return result.rows[0] || null;
};

// =========================================================
// UPDATE CREATOR PROFILE (PARTIAL SAFE UPDATE)
// =========================================================
export const updateCreatorProfile = async (user_id, updates) => {
  const allowedFields = [
    "full_name",
    "age",
    "gender",
    "bio",
    "main_category",
    "collaboration_goal",
    "location",
    "tiktok_url",
    "instagram_url",
    "youtube_url",
    "profile_image",
    "banner_image",
    "followers",
    "engagement_rate"
  ];

  const keys = Object.keys(updates).filter(k =>
    allowedFields.includes(k)
  );

  if (keys.length === 0) {
    throw new Error("No valid fields to update");
  }

  const values = keys.map(k => updates[k]);

  const setQuery = keys
    .map((key, i) => `${key} = $${i + 2}`)
    .join(", ");

  const result = await db.query(
    `
    UPDATE creator_profiles
    SET ${setQuery},
        updated_at = NOW()
    WHERE user_id = $1
    RETURNING *;
    `,
    [user_id, ...values]
  );

  return result.rows[0];
};