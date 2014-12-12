
DROP TABLE IF EXISTS `fy_systempic`;
CREATE TABLE `fy_systempic` (
  `id` int(11) NOT NULL auto_increment,
  `system_pic` varchar(250) NOT NULL,
  `system_picurl` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='首页广告图片表';
INSERT INTO `fy_systempic` VALUES (1, '', '');
INSERT INTO `fy_systempic` VALUES (2, '', '');
INSERT INTO `fy_systempic` VALUES (3, '', '');


DROP TABLE IF EXISTS `fy_business`;
CREATE TABLE `fy_business` (
  `id` int(11) NOT NULL auto_increment,
  `business_content` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='商务合作表';


DROP TABLE IF EXISTS `fy_qrcode`;
CREATE TABLE `fy_qrcode` (
  `id` int(11) NOT NULL auto_increment,
  `source_name` varchar(250) NOT NULL,
  `qrcode_ticket` varchar(500) NOT NULL,
  `qrcode_url` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='二维码表';


DROP TABLE IF EXISTS `fy_logo`;
CREATE TABLE `fy_logo` (
  `id` int(11) NOT NULL auto_increment,
  `logo_name` varchar(250) NOT NULL,
  `logo_uploader` varchar(250) NOT NULL,
  `logo_content` varchar(250) NOT NULL,
  `logo_number` int(11) NOT NULL,
  `logo_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='logo表';


DROP TABLE IF EXISTS `fy_tuan`;
CREATE TABLE `fy_tuan` (
  `id` int(11) NOT NULL auto_increment,
  `tuan_name` varchar(250) NOT NULL,
  `tuan_uploader` varchar(250) NOT NULL,
  `tuan_content` varchar(250) NOT NULL,
  `tuan_number` int(11) NOT NULL,
  `tuan_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='团购表';


DROP TABLE IF EXISTS `fy_usertuan`;
CREATE TABLE `fy_usertuan` (
  `id` int(11) NOT NULL auto_increment,
  `tuan_id` int(4) unsigned NOT NULL default 0,
  `user_id` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='用户团购表';


DROP TABLE IF EXISTS `fy_user`;
CREATE TABLE `fy_user` (
  `id` int(11) NOT NULL auto_increment,
  `user_id` varchar(250) NOT NULL,
  `user_pw` varchar(250) NOT NULL,
  `user_name` varchar(250) NOT NULL,
  `user_phone` varchar(250) NOT NULL,
  `user_school` varchar(250) NOT NULL,
  `user_zhuanye` varchar(250) NOT NULL,
  `user_age` tinyint(3) unsigned NOT NULL,
  `user_weixin` varchar(250) NOT NULL,
  `user_recommend` varchar(250) NOT NULL,
  `user_isrecommend` varchar(250) NOT NULL,
  `user_regdate` datetime NOT NULL,
  `user_status` enum('1','0') NOT NULL,
  `user_type` tinyint(3) unsigned NOT NULL default 2 COMMENT '用户类型，1是后台管理员，2是普通用户',
  `user_logo` tinyint(4) unsigned NOT NULL default 0,
  `user_logodate` datetime NOT NULL,
  `user_from` int(11) unsigned NOT NULL default 0,
  `user_tuanphone` varchar(250) NOT NULL default '',
  `user_tuanaddr` varchar(250) NOT NULL default '',
  `user_tuandate` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY user_id (user_id)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='用户表';
INSERT INTO `fy_user` VALUES (1, 'admin', '21232f297a57a5a743894a0e4a801fc3', '管理员', '', '', '', '', '', '', '', now(), '1', 1);


DROP TABLE IF EXISTS `fy_section`;
CREATE TABLE `fy_section` (
  `id` int(11) NOT NULL auto_increment,
  `section_name` varchar(250) NOT NULL,
  `section_image` varchar(250) NOT NULL,
  `section_type` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='板块表';
INSERT INTO `fy_section` VALUES (1, '雅思', 'fa fa-paper-plane', '培训');
INSERT INTO `fy_section` VALUES (2, '留学', 'fa fa-pencil', '留学');
INSERT INTO `fy_section` VALUES (3, 'SAT', 'fa fa-globe', '培训');
INSERT INTO `fy_section` VALUES (4, '托福', 'fa fa-flag', '培训');
INSERT INTO `fy_section` VALUES (5, '游学', 'fa fa-book', '培训');
INSERT INTO `fy_section` VALUES (6, '银行', 'fa fa-graduation-cap', '培训');



DROP TABLE IF EXISTS `fy_edu`;
CREATE TABLE `fy_edu` (
  `id` int(11) NOT NULL auto_increment,
  `edu_name` varchar(250) NOT NULL,
  `edu_star` tinyint(3) unsigned NULL ,
  `edu_image` varchar(250) NULL,
  `edu_discount` varchar(250) NULL COMMENT '奖学金',
  `edu_desc` text NULL,
  `edu_showprice` int(11) unsigned NULL COMMENT '展示佣金金额',
  `edu_giveprice` int(11) unsigned NULL COMMENT '投放佣金金额',
  `edu_ask` int(11) unsigned NULL default 0 COMMENT '咨询量',
  `edu_browse` int(11) unsigned NULL default 0 COMMENT '浏览量',
  `edu_recommend` int(11) unsigned NULL default 0 COMMENT '推荐量',
  `edu_sign` int(11) unsigned NULL default 0 COMMENT '签约量',
  `edu_jblx` enum('0','1') NULL,
  `edu_tglx` enum('0','1') NULL,
  `edu_jbxx` enum('0','1') NULL,
  `edu_tgxx` enum('0','1') NULL,
  `edu_order1` int(11) unsigned NULL default 10000 COMMENT '雅思板块排序',
  `edu_order2` int(11) unsigned NULL default 10000 COMMENT '留学板块排序',
  `edu_order3` int(11) unsigned NULL default 10000 COMMENT 'SAT板块排序',
  `edu_order4` int(11) unsigned NULL default 10000 COMMENT '托福板块排序',
  `edu_order5` int(11) unsigned NULL default 10000 COMMENT '游学板块排序',
  `edu_order6` int(11) unsigned NULL default 10000 COMMENT '小语种板块排序',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='教育机构表';


DROP TABLE IF EXISTS `fy_sectionedu`;
CREATE TABLE `fy_sectionedu` (
  `id` int(11) NOT NULL auto_increment,
  `edu_id` int(11) unsigned NOT NULL,
  `section_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='板块机构对应表';


DROP TABLE IF EXISTS `fy_order`;
CREATE TABLE `fy_order` (
  `id` int(11) NOT NULL auto_increment,
  `user_id` varchar(250) NOT NULL,
  `user_name` varchar(250) NOT NULL,
  `edu_id` varchar(250) NOT NULL,
  `edu_name` varchar(250) NOT NULL,
  `order_number` varchar(250) NOT NULL,
  `order_date` datetime NOT NULL,
  `order_phone` varchar(250) NOT NULL,
  `order_status` enum('0','1','2','3') NOT NULL COMMENT '推荐确认/等待签约/奖金发放/发放成功',
  `order_discount` varchar(250) NOT NULL,
  `order_remark` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='订单表';


DROP TABLE IF EXISTS `fy_pyorder`;
CREATE TABLE `fy_pyorder` (
  `id` int(11) NOT NULL auto_increment,
  `user_id` varchar(250) NOT NULL,
  `user_pyname` varchar(250) NOT NULL,
  `user_pyphone` varchar(250) NOT NULL,
  `user_pydesc` text NOT NULL,
  `order_number` varchar(250) NOT NULL,
  `order_date` datetime NOT NULL,
  `order_status` enum('0','1','2','3') NOT NULL COMMENT '推荐确认/等待签约/奖金发放/发放成功',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='推荐朋友表';


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


DROP TABLE IF EXISTS `fy_jbedu`;
CREATE TABLE `fy_jbedu` (
  `id` int(11) NOT NULL auto_increment,
  `jborder_id` varchar(250) NOT NULL,
  `edu_id` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='结伴留学机构表';