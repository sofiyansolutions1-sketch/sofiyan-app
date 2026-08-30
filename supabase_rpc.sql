-- Run this in your Supabase SQL Editor
CREATE OR REPLACE FUNCTION get_nearby_leads(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius DOUBLE PRECISION
) RETURNS SETOF bookings AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM bookings
  WHERE status = 'pending'
    AND lat IS NOT NULL
    AND lng IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(lat)) * cos(radians(lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(lat))
      )
    ) <= p_radius;
END;
$$ LANGUAGE plpgsql STABLE;
