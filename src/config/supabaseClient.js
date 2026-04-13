import { createClient } from "@supabase/supabase-js"

export const supabase = (() => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Faltan variables de entorno:
       URL=${supabaseUrl}
       KEY=${supabaseKey ? "OK" : "MISSING"}`
    )
  }

  return createClient(supabaseUrl, supabaseKey)
})()