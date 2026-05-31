import {
  exchangeCodeForToken,
  debugMe,
  getPages,
  getInstagramAccount
} from "../services/instagram.service.js";

export const login = async (req, res) => {
  try {

    const authUrl =
      `https://www.facebook.com/v23.0/dialog/oauth` +
      `?client_id=${process.env.INSTAGRAM_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(
        process.env.INSTAGRAM_REDIRECT_URI
      )}` +
      `&scope=pages_show_list,pages_read_engagement,instagram_basic` +
      `&response_type=code`;

    return res.redirect(authUrl);

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
};

export const callback = async (req, res) => {
  try {

    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        error: "No code received"
      });
    }

    const token =
      await exchangeCodeForToken(code);

    console.log("\n===== TOKEN =====");
    console.log(token);

    const me =
      await debugMe(token.access_token);

    console.log("\n===== USER =====");
    console.log(me);

    const pages =
      await getPages(token.access_token);

    console.log("\n===== PAGES =====");
    console.log(
      JSON.stringify(
        pages,
        null,
        2
      )
    );

    let instagramData = null;

    if (
      pages.data &&
      pages.data.length > 0
    ) {

      const pageId =
        pages.data[0].id;

      instagramData =
        await getInstagramAccount(
          token.access_token,
          pageId
        );

      console.log(
        "\n===== INSTAGRAM ACCOUNT ====="
      );

      console.log(
        JSON.stringify(
          instagramData,
          null,
          2
        )
      );
    }

    return res.json({
      token,
      me,
      pages,
      instagramData
    });

  } catch (error) {

    console.log(
      "\n===== META ERROR ====="
    );

    console.log(
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      error:
        error.response?.data ||
        error.message
    });

  }
};