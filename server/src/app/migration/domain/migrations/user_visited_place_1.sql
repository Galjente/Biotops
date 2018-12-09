CREATE TABLE IF NOT EXISTS `user_visited_place` (
  id INT NOT NULL AUTO_INCREMENT,
  `user_fk` INT NOT NULL,
  `place_fk` INT NOT NULL,
  latitude DECIMAL(15,13) NOT NULL,
  longitude DECIMAL(15,13) NOT NULL,
  creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_date TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (`user_fk`) REFERENCES `user`(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (`place_fk`) REFERENCES `place`(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY `user_visited_place_unique`(`user_fk`, `place_fk`)
)
ENGINE=InnoDB
CHARACTER SET utf8
COLLATE utf8_bin;
# CREATE UNIQUE INDEX `user_visited_place_unique` ON `user_visited_place`(`user_fk`,`place_fk`);