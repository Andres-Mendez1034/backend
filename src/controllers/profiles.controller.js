import { supabase } from "../config/supabaseClient.js"

// ==========================
// CREAR INFLUENCER PROFILE
// ==========================
export const createInfluencerProfile = async (req, res) => {
  try {
    const {
      user_id,
      full_name,
      id_number,
      category,
      location
    } = req.body

    if (!user_id || !full_name || !id_number) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const { data, error } = await supabase
      .from("influencer_profiles")
      .insert([
        {
          user_id,
          full_name,
          id_number,
          category,
          location
        }
      ])
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(201).json({
      message: "Influencer profile created",
      profile: data[0]
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}


// ==========================
// CREAR CLIENT PROFILE
// ==========================
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
    } = req.body

    if (!user_id || !business_name || !owner_name) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const { data, error } = await supabase
      .from("client_profiles")
      .insert([
        {
          user_id,
          business_name,
          owner_name,
          business_type,
          location,
          awareness_level,
          main_goal
        }
      ])
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(201).json({
      message: "Client profile created",
      profile: data[0]
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}


// ==========================
// OBTENER PERFIL POR USER
// ==========================
export const getProfileByUser = async (req, res) => {
  try {
    const { user_id } = req.params

    // buscar influencer
    const influencer = await supabase
      .from("influencer_profiles")
      .select("*")
      .eq("user_id", user_id)
      .single()

    // buscar client
    const client = await supabase
      .from("client_profiles")
      .select("*")
      .eq("user_id", user_id)
      .single()

    return res.json({
      influencer: influencer.data || null,
      client: client.data || null
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}


// ==========================
// UPDATE INFLUENCER PROFILE
// ==========================
export const updateInfluencerProfile = async (req, res) => {
  try {
    const { user_id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from("influencer_profiles")
      .update(updates)
      .eq("user_id", user_id)
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json({
      message: "Profile updated",
      profile: data[0]
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}