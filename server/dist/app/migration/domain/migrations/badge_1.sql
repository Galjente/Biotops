CREATE TABLE IF NOT EXISTS `badge` (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  congratulation_text TEXT,
  aim_text TEXT,
  image_activate_fk INT NULL,
  image_deactivate_fk INT NULL,
  published BOOL NOT NULL DEFAULT 0,
  deleted BOOL NOT NULL DEFAULT 0,
  achievement_function_name VARCHAR(255) NULL,
  creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_date TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (image_activate_fk) REFERENCES `image`(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (image_deactivate_fk) REFERENCES `image`(id) ON UPDATE CASCADE ON DELETE RESTRICT
)
ENGINE=InnoDB
CHARACTER SET utf8
COLLATE utf8_bin;