CREATE OR REPLACE FUNCTION get_nearby_leads(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION
)
RETURNS SETOF bookings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- R is Earth's radius in kilometers
    R DOUBLE PRECISION := 6371;
BEGIN
    RETURN QUERY
    SELECT *
    FROM bookings b
    WHERE b.status = 'pending'
      AND b.lat IS NOT NULL
      AND b.lng IS NOT NULL
      AND (
          R * 2 * ASIN(SQRT(
              POWER(SIN((b.lat - p_lat) * pi() / 180 / 2), 2) +
              COS(p_lat * pi() / 180) * COS(b.lat * pi() / 180) *
              POWER(SIN((b.lng - p_lng) * pi() / 180 / 2), 2)
          ))
      ) <= p_radius_km;
END;
$$;
