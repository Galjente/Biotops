CREATE TABLE IF NOT EXISTS `device_error` (
  id INT NOT NULL AUTO_INCREMENT,
  user_fk INT NULL,
  os_name VARCHAR(12) NULL,
  os_version VARCHAR(50) NULL,
  message TEXT NULL,
  class_name VARCHAR(255) NULL,
  deleted BOOL NOT NULL DEFAULT 0,
  creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_date TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (`user_fk`) REFERENCES `user`(id) ON UPDATE CASCADE ON DELETE RESTRICT
)
ENGINE=InnoDB
CHARACTER SET utf8
COLLATE utf8_bin;