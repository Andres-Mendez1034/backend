import {
  createCreatorProfile,
  getCreatorProfileByUser,
  updateCreatorProfile
} from "../services/creator.service.js";

// =========================================================
// CREATE OR UPDATE CREATOR PROFILE (ONBOARDING)
// =========================================================
export const upsertCreatorProfile = async (req, res) => {
  try {
    const data = req.body;

    if (!data.user_id) {
      return res.status(400).json({
        error: "user_id is required"
      });
    }

    const profile = await createCreatorProfile(data);

    return res.status(200).json({
      message: "Creator profile saved successfully",
      profile
    });

  } catch (err) {
    console.error("CREATE CREATOR ERROR:", err);
    return res.status(500).json({
      error: err.message
    });
  }
};

// =========================================================
// GET CREATOR PROFILE BY USER
// =========================================================
export const getCreatorProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        error: "user_id is required"
      });
    }

    const profile = await getCreatorProfileByUser(user_id);

    return res.status(200).json({
      profile
    });

  } catch (err) {
    console.error("GET CREATOR ERROR:", err);
    return res.status(500).json({
      error: err.message
    });
  }
};

// =========================================================
// UPDATE CREATOR PROFILE (PATCH SAFE)
// =========================================================
export const patchCreatorProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const updates = req.body;

    if (!user_id) {
      return res.status(400).json({
        error: "user_id is required"
      });
    }

    const updatedProfile = await updateCreatorProfile(user_id, updates);

    return res.status(200).json({
      message: "Creator profile updated",
      profile: updatedProfile
    });

  } catch (err) {
    console.error("UPDATE CREATOR ERROR:", err);
    return res.status(500).json({
      error: err.message
    });
  }
};