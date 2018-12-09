CREATE TABLE IF NOT EXISTS `place_image` (
  `place_fk` INT NOT NULL,
  `image_fk` INT NOT NULL,
  FOREIGN KEY (`place_fk`) REFERENCES `place`(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (`image_fk`) REFERENCES `image`(id) ON UPDATE CASCADE ON DELETE RESTRICT
)
ENGINE=InnoDB
CHARACTER SET utf8
COLLATE utf8_bin;