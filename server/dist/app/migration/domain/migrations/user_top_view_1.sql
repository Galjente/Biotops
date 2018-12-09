CREATE VIEW user_top AS
  SELECT
    u.id as user_fk,
    COUNT(uvp.id) as place_count,
    MAX(uvp.creation_date) as last_checkin_date
  FROM `user` u
  LEFT JOIN `user_visited_place` uvp ON u.id = uvp.user_fk
  WHERE u.enabled = 1
  GROUP BY u.id
  ORDER BY place_count DESC, last_checkin_date ASC;