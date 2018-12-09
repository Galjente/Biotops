CREATE TABLE IF NOT EXISTS `user` (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NULL,
  surname VARCHAR(255) NULL,
  login VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  secret VARCHAR(255) NULL,
  token VARCHAR(255) NULL,
  facebook_id VARCHAR(32) NULL,
  profile_photo_link TEXT,
  admin BOOL DEFAULT 0,
  enabled BOOL DEFAULT 1,
  deleted BOOL DEFAULT 0,
  friends_update_date TIMESTAMP NULL DEFAULT NULL,
  creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_date TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY(id),
  UNIQUE(login), UNIQUE(token), UNIQUE(facebook_id)
)
ENGINE=InnoDB
CHARACTER SET utf8
COLLATE utf8_bin;