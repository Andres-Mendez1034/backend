import db from "../config/db.js";
import {
  exchangeCodeForToken,
  debugMe,
  getPages,
  getInstagramAccount,
  getProfile,
  getMedia,
  getInsights,
  getIgIdByUsername
} from "../services/instagram.service.js";

export const login = async (req, res) => {
  try {
    const { user_id } = req.query;

    const authUrl =
      `https://www.facebook.com/v23.0/dialog/oauth` +
      `?client_id=${process.env.INSTAGRAM_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI)}` +
      `&scope=pages_show_list,pages_read_engagement,instagram_basic` +
      `&response_type=code` +
      `&state=${user_id}`;

    return res.redirect(authUrl);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const callback = async (req, res) => {
  try {
    const { code, state: userId } = req.query;
    if (!code) return res.status(400).json({ error: "No code received" });

    const token = await exchangeCodeForToken(code);
    const pages = await getPages(token.access_token);

    let igId = null;
    if (pages.data && pages.data.length > 0) {
      igId = pages.data[0].instagram_business_account?.id;
    }

    if (igId && userId) {
      await db.query(
        `UPDATE users SET 
          instagram_id = $1, 
          instagram_token = $2,
          instagram_token_expires_at = NOW() + INTERVAL '60 days'
        WHERE id = $3`,
        [igId, token.access_token, userId]
      );
      console.log(`✅ Instagram conectado para user ${userId}`);
    }

    return res.redirect(`${process.env.FRONTEND_URL}/profile?instagram=connected`);

  } catch (error) {
    return res.status(500).json({ error: error.response?.data || error.message });
  }
};

export const profile = async (req, res) => {
  try {
    const { token, ig_id } = req.query;
    if (!token || !ig_id) return res.status(400).json({ error: "Token e ig_id requeridos" });
    const data = await getProfile(token, ig_id);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.response?.data || error.message });
  }
};

export const media = async (req, res) => {
  try {
    const { token, ig_id } = req.query;
    if (!token || !ig_id) return res.status(400).json({ error: "Token e ig_id requeridos" });
    const data = await getMedia(token, ig_id);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.response?.data || error.message });
  }
};

export const insights = async (req, res) => {
  try {
    const { token, ig_id } = req.query;
    if (!token || !ig_id) return res.status(400).json({ error: "Token e ig_id requeridos" });
    const data = await getInsights(token, ig_id);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.response?.data || error.message });
  }
};

export const syncMetrics = async (req, res) => {
  try {
    const { instagram_id, followers, media_count, reach, impressions } = req.body;
    return res.json({ success: true, instagram_id, followers, media_count, reach, impressions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const searchByUsername = async (req, res) => {
  try {
    const { username, token } = req.query;
    if (!username || !token) return res.status(400).json({ error: "Username y token requeridos" });
    const data = await getIgIdByUsername(username, token);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.response?.data || error.message });
  }
};