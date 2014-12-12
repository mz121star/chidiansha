
DROP TABLE IF EXISTS `fy_jborder`;
CREATE TABLE `fy_jborder` (
  `id` int(11) NOT NULL auto_increment,
  `user_id` varchar(250) NOT NULL,
  `user_jbname` varchar(250) NOT NULL,
  `user_jbphone` varchar(250) NOT NULL,
  `user_jbdesc` text NOT NULL,
  `order_number` varchar(250) NOT NULL,
  `order_type` enum('1','2') NOT NULL COMMENT '1：结伴订单，2：团购订单',
  `order_date` datetime NOT NULL,
  `order_status` enum('0','1','2','3') NOT NULL COMMENT '推荐确认/等待签约/奖金发放/发放成功',
  `order_parent` int(11) unsigned NOT NULL default 0,
  `order_remark` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='结伴留学表';