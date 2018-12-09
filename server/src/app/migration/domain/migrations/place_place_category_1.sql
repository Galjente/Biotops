CREATE TABLE IF NOT EXISTS `place_place_category` (
  `place_fk` INT NOT NULL,
  `place_category_fk` INT NOT NULL,
  FOREIGN KEY (`place_fk`) REFERENCES `place`(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (`place_category_fk`) REFERENCES `place_category`(id) ON UPDATE CASCADE ON DELETE RESTRICT
)
ENGINE=InnoDB
CHARACTER SET utf8
COLLATE utf8_bin;