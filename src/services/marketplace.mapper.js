// =====================================
// MARKETPLACE MAPPER (DTO LAYER)
// Convierte DB (services) → Frontend (influencers)
// =====================================

export const mapServiceToInfluencer = (service) => ({
  id: service.service_id,
  title: service.influencer_name,
  tag: service.category,
  price: Number(service.price),
  status: service.status,
  trending: service.is_trending,
  location: service.location || "Bogotá",
  image: service.image || null
});

// ==========================
// ARRAY MAPPER (LISTS)
// ==========================
export const mapServicesToInfluencers = (services = []) => {
  return services.map(mapServiceToInfluencer);
};