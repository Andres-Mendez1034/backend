import { supabase } from "../config/supabaseClient.js"

// ==========================
// CREAR SERVICIO (INFLUENCER)
// ==========================
export const createService = async (req, res) => {
  try {
    const {
      user_id,
      influencer_name,
      category,
      price,
      is_trending,
      status
    } = req.body

    if (!user_id || !influencer_name || !price) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const { data, error } = await supabase
      .from("influencer_services")
      .insert([
        {
          user_id,
          influencer_name,
          category,
          price,
          is_trending: is_trending || false,
          status: status || "available"
        }
      ])
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(201).json({
      message: "Service created",
      service: data[0]
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}


// ==========================
// OBTENER TODOS LOS SERVICIOS
// ==========================
export const getAllServices = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("influencer_services")
      .select("*")
      .order("service_id", { ascending: false })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json(data)

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}


// ==========================
// SERVICIOS POR USUARIO
// ==========================
export const getServicesByUser = async (req, res) => {
  try {
    const { user_id } = req.params

    const { data, error } = await supabase
      .from("influencer_services")
      .select("*")
      .eq("user_id", user_id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json(data)

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}


// ==========================
// UPDATE STATUS (BONUS útil)
// ==========================
export const updateServiceStatus = async (req, res) => {
  try {
    const { service_id, status } = req.body

    const { data, error } = await supabase
      .from("influencer_services")
      .update({ status })
      .eq("service_id", service_id)
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json({
      message: "Service updated",
      service: data[0]
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}