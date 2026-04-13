import { supabase } from "../config/supabaseClient.js"

// ==========================
// CREATE SERVICE
// ==========================
export const createService = async (serviceData) => {
  const {
    user_id,
    influencer_name,
    category,
    price,
    is_trending,
    status
  } = serviceData

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

  if (error) throw error

  return data[0]
}


// ==========================
// GET ALL SERVICES (MARKETPLACE)
// ==========================
export const getAllServices = async () => {
  const { data, error } = await supabase
    .from("influencer_services")
    .select("*")
    .order("service_id", { ascending: false })

  if (error) throw error

  return data
}


// ==========================
// GET SERVICES BY USER
// ==========================
export const getServicesByUser = async (user_id) => {
  const { data, error } = await supabase
    .from("influencer_services")
    .select("*")
    .eq("user_id", user_id)

  if (error) throw error

  return data
}


// ==========================
// UPDATE SERVICE STATUS
// ==========================
export const updateServiceStatus = async (service_id, status) => {
  const { data, error } = await supabase
    .from("influencer_services")
    .update({ status })
    .eq("service_id", service_id)
    .select()

  if (error) throw error

  return data[0]
}