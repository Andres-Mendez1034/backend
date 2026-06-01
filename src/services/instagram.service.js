import axios from "axios";

const BASE = "https://graph.facebook.com/v23.0";

export const exchangeCodeForToken = async (code) => {
  const response = await axios.get(`${BASE}/oauth/access_token`, {
    params: {
      client_id: process.env.INSTAGRAM_APP_ID,
      client_secret: process.env.INSTAGRAM_APP_SECRET,
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
      code
    }
  });
  return response.data;
};

export const debugMe = async (accessToken) => {
  const response = await axios.get(`${BASE}/me`, {
    params: { fields: "id,name", access_token: accessToken }
  });
  return response.data;
};

export const getPages = async (accessToken) => {
  const response = await axios.get(`${BASE}/me/accounts`, {
    params: {
      fields: "id,name,access_token,instagram_business_account",
      access_token: accessToken
    }
  });
  return response.data;
};

export const getInstagramAccount = async (accessToken, pageId) => {
  const response = await axios.get(`${BASE}/${pageId}`, {
    params: { fields: "instagram_business_account", access_token: accessToken }
  });
  return response.data;
};

export const getProfile = async (accessToken, igId) => {
  const response = await axios.get(`${BASE}/${igId}`, {
    params: {
      fields: "id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url",
      access_token: accessToken
    }
  });
  return response.data;
};

export const getMedia = async (accessToken, igId) => {
  const response = await axios.get(`${BASE}/${igId}/media`, {
    params: {
      fields: "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
      access_token: accessToken
    }
  });
  return response.data;
};

export const getInsights = async (accessToken, igId) => {
  const response = await axios.get(`${BASE}/${igId}/insights`, {
    params: {
      metric: "impressions,reach,profile_views",
      period: "day",
      access_token: accessToken
    }
  });
  return response.data;
};

export const getIgIdByUsername = async (username, accessToken) => {
  const response = await axios.get(`${BASE}/${username}`, {
    params: {
      fields: "id,username",
      access_token: accessToken
    }
  });
  return response.data;
};