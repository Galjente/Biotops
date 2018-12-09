INSERT INTO `place_category`(`key`,`name`, `icon_fk`) VALUES
('flora_1', 'Flora', (SELECT id FROM `image` WHERE `hash`='Hrose_iconC')),
('fauna_1', 'Fauna', (SELECT id FROM `image` WHERE `hash`='Hleg_iconC')),
('water_1', 'Ūdeņi', (SELECT id FROM `image` WHERE `hash`='Hwave_iconC')),
('geo_1', 'Ģeoloģija', (SELECT id FROM `image` WHERE `hash`='Hdimond_iconC')),
('tower_1', 'Skatu torņi', (SELECT id FROM `image` WHERE `hash`='Htower_iconC')),
('mount_1', 'Kalni', (SELECT id FROM `image` WHERE `hash`='Hmount_iconC'));