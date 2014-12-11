var jscartlist = new function() {
	this.cart = [];//
	this.minleast = 0;
	this.oneminleast = 0;//单份最低外送价
	this.info_id = 0;//当前选中编辑的地址id
	this.saveinfo = false;//是否正在保存
	this.shopid = 0;
	this.addprice = 0;
	this.order_verify = 0;
	this.verifytel = '';
	this.timeout = [];
	this.defaultval = []//当前选择值

	this.init = function(data) {
		this.cart['id_' + this.shopid] = [];
		for(var i = 0 ; i < data.length ; i++) {
			this.cart['id_' + this.shopid][i] = data[i].split("_");
		}
	}
	this.cart_del = function(o , shopid , menuid ,price) {
		var p1 = kj.parent(o , "td");
		var p2 = kj.parent(p1 , "tr");
		var p3 = kj.obj(".x_list1" ,kj.parent(p2 , "div"));
		var p4 = kj.obj("li" ,p1);
		var obj_plus = kj.obj(".x_plus" ,p1);
		var index = kj.index(kj.obj(".x_menu" ,p1) , o);//当前菜品，在菜品中的索引
		var index2 = kj.index(p3 , p2);//行所在索引
		var index3 = kj.index(p4 , o ,true);//当前菜器，在li中的索引,计算有没有plus，有则删除
		var id = 'id_'+shopid;
		if(!(id in this.cart)) return;
		var arrid_obj = kj.obj(":menuid[]" , p1);
		var arrid =[];
		for(var i = 0 ; i < arrid_obj.length ; i++) {
			arrid[arrid.length] = kj.toint(arrid_obj[i].value);
		}
		var ids = arrid.join(",");
		//删除左边加号
		if(obj_plus.length>index3) {
			kj.remove(obj_plus[index3-1]); 
		} else if(p4.length>1) {
			kj.remove(p4[index3+1]); 
		}
		//移除菜品li
		kj.remove(o);
		//cart 中移除
		var isdelrow = false;
		for(i = 0 ; i < this.cart[id].length ; i++) {
			if(this.cart[id][i].join(",") == ids) {
				this.cart[id][i].removeat(index);
				if(this.cart[id][i].length<1) isdelrow = true;
			}
		}

		//如果当前行都删除了，则移除行
		if(isdelrow == true) {
			kj.remove(p3[index2]);
			//如果当前店没有餐了，则删除当前店显示
			if(this.cart[id].length<1) {
				this.cart.remove(id);
				kj.remove("#id_shop_"+shopid);
			}
		}
		this.refresh_price(shopid , p2);
	}
    this.sendcartnum = function (id, number) {
        var ids = id.split("_");
        if (number == 1) {
            $.post("/index.php/cart/inc", { 'id': ids[2]} );
        } else if (number == -1) {
            $.post("/index.php/cart/dec", { 'id': ids[2]} );
        } else {
            $.post("/index.php/cart/setnum", { 'id': ids[2], 'num': number} );
        }
    }
    this.delfromcart = function (id) {
        $.post("/index.php/cart/delete", { 'id': id } );
    }
	//移除行
	this.cart_remove = function(o , shopid ,menuid) {
		var obj_p = kj.parent(o,"tr");
		kj.remove(obj_p);
		var id = 'id_'+shopid;
		var length = this.cart[id].length;
		for(i = 0;i<length;i++) {
			if(this.cart[id][i]==menuid) {
				this.cart[id].removeat(i);
				i--;
				this.ordernum--;
			}
		}
		//如果当前店没有餐了，则删除当前店显示
		if(!('length' in this.cart[id])) {
			this.cart.remove(id);
			kj.remove("#id_shop_"+shopid);
		}
		this.refresh_price(shopid);
        this.delfromcart(menuid);
	}
	//刷新价格
	this.refresh_price = function(shopid , objrow) {
		if(!shopid) shopid = this.shopid;
		//刷新单行价
		if(objrow) {
			var obj_price = kj.obj(".menu_price" , objrow);
			var total = kj.toint(obj_price[0].innerHTML);

			var obj_menuprice = kj.obj("input<<name,/^menuprice/i" , objrow);
			var obj_num = kj.obj("input<<name,/^menunum/i" , objrow);
			val = 0;
			for(j = 0 ; j < obj_menuprice.length ; j++ ) {
				val += kj.toint(obj_menuprice[j].value);
			}
			//算价
			obj_price[0].innerHTML = kj.toint(val * kj.toint(obj_num[0].value));
		}

		var shop = kj.obj("#id_shop_"+shopid);
		var obj_price = kj.obj(".menu_price" , shop);
		var obj_score = kj.obj("#id_score_input");
		var obj_repayment = kj.obj("#id_repayment_input");
		var price = 0,score = 0 , repayment = 0 ,i,j,x;
		if(obj_score) score = kj.toint(obj_score.value);
		if(obj_repayment) repayment = kj.toint(obj_repayment.value);
		for(i = 0 ; i < obj_price.length; i++) {
			price += kj.toint(obj_price[i].innerHTML);
		}
		kj.set("#id_shop_total_"+shopid , "innerHTML" , price);
		//先刷新活动计价
		this.act_where_money(price);
		var act_price = 0;
		if(kj.obj('#id_shop_act_'+shopid)) act_price = kj.toint(kj.obj('#id_shop_act_'+shopid).innerHTML);
		var total = price - score - act_price - repayment;
		total = kj.toint(total);
		//加配送费
		if(this.minaddprice > 0) total = total + kj.toint(this.minaddprice);
		kj.set("#id_shop_score_"+shopid,'innerHTML',score);
		kj.set("#id_shop_repayment_"+shopid,'innerHTML',repayment);
		kj.set("#id_shop_addprice_"+shopid,'innerHTML',this.minaddprice);
		kj.set(".id_shop_price_"+shopid,"innerHTML",total);
		( this.minaddprice == 0 ) ? kj.hide( kj.parent("#id_shop_addprice_"+shopid,'span') ) : kj.show(kj.parent("#id_shop_addprice_"+shopid,'span'));
		( score == 0 ) ? kj.hide( kj.parent("#id_shop_score_"+shopid,'span') ) : kj.show(kj.parent("#id_shop_score_"+shopid,'span'));
		( repayment == 0 ) ? kj.hide( kj.parent("#id_shop_repayment_"+shopid,'span') ) : kj.show(kj.parent("#id_shop_repayment_"+shopid,'span'));
		( act_price == 0 ) ? kj.hide( kj.parent("#id_shop_act_"+shopid,'span') ) : kj.show(kj.parent("#id_shop_act_"+shopid,'span'));
		//应付款为0
		var arr = kj.obj("#id_paymethod_" + shopid + " li");
		if(total == 0) {
			kj.hide(arr);
			kj.show(arr[0]);
			kj.set(kj.obj(":paymethod",arr[0]) , "checked" , true);
		} else {
			kj.show(arr);
			kj.hide(arr[0]);
			var arr1 = kj.obj(":paymethod",arr[0]);
			if(arr1[0].checked) kj.set(kj.obj(":paymethod",arr[1]) , "checked" , true);
		}
		//刷新积分
		var scorebase = ('base' in this.action_score) ? kj.toint(this.action_score.base) * (total+ act_price) : 0;
		if('add' in this.action_score) scorebase += kj.toint(this.action_score.add);
		var score = 0;
		var obj_price = kj.obj(":act_money[]");
		var i,attr,obj;
		for(i = 0;i<obj_price.length;i++) {
			attr = kj.getAttribute(obj_price[i],"extscore");
			obj = kj.json(attr);
			if(!obj) continue;
			if('add' in obj) score+= kj.toint(obj.add);
			if('bei' in obj) score+= kj.toint(obj.bei)*scorebase;
		}
		score+=scorebase;
		kj.set("#id_scoreintro_"+shopid , "innerHTML" , parseInt(score));
		return total;
	}
	this.info_del = function(id) {
		if(!confirm("确定要删除吗？")) {
			return;
		}
		kj.ajax.get(kj.cfg('baseurl') + "/index.php?app=ajax&app_act=del_info&id="+id , function(data) {
			var obj_data=kj.json(data);
			jscartlist.submiting = false;
			if(obj_data.isnull) {
				alert("操作失败");
			} else {
				if('code' in obj_data && obj_data.code=='0') {
					kj.remove("#id_info_"+id);
				}else{
					if("msg" in obj_data){
						alert(obj_data.msg);
					}else{
						alert("操作失败");
					}
				}
			}
		});
	}
	//选择收货地址时
	this.infosel = function(o ,id){
		if(this.info_id) {
			this.info_cancel();
			this.info_id=0;
		}
		var val,x;
		val = kj.toint(o.value);
		if(val > 0) {
			kj.hide("#id_new_infosel");
		} else {
			kj.show("#id_new_infosel");
		}
		kj.delClassName(kj.obj("#id_address_info table") , "x_sel1");
		kj.addClassName(kj.parent(o , 'table'), "x_sel1");
		var html = kj.obj("#id_dispatch_" + id).innerHTML;
		html = html.replace('起送价：','');
		jscartlist.minleast = kj.toint(html);
		html = kj.obj("#id_addprice_" + id).innerHTML;
		html = html.replace('配送费：','');
		jscartlist.minaddprice = kj.toint(html);
		this.refresh_price();
	}
	//编辑已有收货地址
	this.info_edit = function(id) {
		if(id>0) {
			if(jscartlist.info_id) kj.show("#id_info_" + jscartlist.info_id);
			jscartlist.info_id = id;
			kj.delClassName(kj.obj("#id_address_info table") , "x_sel1");
			kj.addClassName(kj.obj("#id_edit_infodiv") , "x_sel1");
			kj.ajax(kj.cfg('baseurl') + "/index.php?app_act=getinfo&id=" + id , function(data) {
				var obj = kj.json(data);
				if(! obj.isnull) {
					jscartlist.editinfo = obj;
					document.frm_main.louhao1.value=obj.info_louhao1;
					document.frm_main.louhao2.value=obj.info_louhao2;
					document.frm_main.company.value=obj.info_company;
					document.frm_main.depart.value=obj.info_depart;
					document.frm_main.name.value=obj.info_name;
					document.frm_main.tel.value=obj.info_tel;
					document.frm_main.telext.value=obj.info_telext;
					document.frm_main.mobile.value=obj.info_mobile;
					jscartlist.verifytel = obj.info_mobile;
					for(var i = 0 ; i < document.frm_main.sex.length ; i++ ) {
						if(document.frm_main.sex[i].value == obj.info_sex) {
							document.frm_main.sex[i].checked = true;
							break;
						}
					}
					if(obj.info_area_allid!='') {
						obj.info_area_allid += '';
						var arr = obj.info_area_allid.split(",");

						//加载默认值选中
						jscartlist.select_sel(kj.obj("#id_area_0") , arr[0]);
						for(var i=0 ; i < jscartlist.depth ; i++) {
							if(arr.length<=i) break;
							jscartlist.changearea(arr[i],i,arr[i+1]);
						}

					}
					var obj_col = kj.obj("#id_info_editcol");
					var obj_table = kj.obj("table" , obj_col);
					if(obj_table.length<1) {
						obj_col.appendChild(kj.obj("#id_new_infosel"));
					}
					kj.insert_after("#id_address_info" , "#id_info_" + jscartlist.info_id , "#id_edit_infodiv");
					kj.show("#id_new_infosel");
					kj.show("#id_edit_infodiv");
					kj.hide("#id_info_" + jscartlist.info_id);
					kj.obj("#id_new_edit_radior").checked=true;

				}
			});
		}
	}
	//取消编辑
	this.info_cancel = function(cancel) {
		var obj_col = kj.obj("#id_new_infocol");
		var obj_table = kj.obj("table" , obj_col);
		if(obj_table.length<1) {
			obj_col.appendChild(kj.obj("#id_new_infosel"));
		}
		kj.hide("#id_info_" + jscartlist.info_id);
		kj.hide("#id_new_infosel");
		kj.hide("#id_edit_infodiv");
		kj.show("#id_info_" + jscartlist.info_id);
		if(cancel) kj.obj("#id_info_radior"+jscartlist.info_id).checked=true;
		if(this.info_id>0) {
			kj.addClassName(kj.obj("#id_info_"+jscartlist.info_id), "x_sel1");
		}
		this.info_id = 0;
	}
	//提交收货信息
	this.info_save = function() {
		var area = kj.obj("#id_area").value;
		var area_allid = kj.obj("#id_area_allid").value;
		var area_id = kj.obj("#id_area_id").value;
		var sex='';
		if(this.chk_info() == false) return;
		if(document.frm_main.sex[0].checked) {
			sex = document.frm_main.sex[0].value;
		} else if(document.frm_main.sex[1].checked){
			sex = document.frm_main.sex[1].value;
		}
		//手机短信验证
		if(this.is_orderverify()) return;
		var company = (document.frm_main.company.value=='' || document.frm_main.company.value=='公司名称-选填') ? '' :  document.frm_main.company.value;
		var depart = (document.frm_main.depart.value=='' || document.frm_main.depart.value=='部门-选填') ? '' :  document.frm_main.depart.value;
		var data = {"id":this.info_id,"name":document.frm_main.name.value,"area":area,"area_id":area_id,"area_allid":area_allid,"louhao1":document.frm_main.louhao1.value,"louhao2":document.frm_main.louhao2.value,"company":company,"depart":depart,"sex":sex,"tel":document.frm_main.tel.value,"telext":document.frm_main.telext.value,"mobile":document.frm_main.mobile.value};
		jscartlist.saveinfo = true;
		kj.ajax.post(kj.cfg('baseurl') + "/index.php?app=ajax&app_act=saveinfo" , data ,function(data){
			var obj_data=kj.json(data);
			jscartlist.saveinfo = false;
			if(obj_data.isnull) {
				alert("保存失败");
			} else {
				if('code' in obj_data && obj_data.code=='0') {
					kj.alert.show("保存成功");
					var sex = document.frm_main.sex[0].value;
					var str;
					if(document.frm_main.sex[1].checked) sex = document.frm_main.sex[1].value;
					//修改
					var html = '';
					html = document.frm_main.name.value + "（" + sex + "）";
					kj.set("#id_info_name"+jscartlist.info_id , "innerHTML" , html);
					html = 	kj.obj("#id_area").value + " — " + document.frm_main.louhao1.value;
					if(document.frm_main.company.value!='' && document.frm_main.company.value!='公司名称-选填') {
						html+= " — " + document.frm_main.company.value;
						if(document.frm_main.depart.value!='部门-选填' && document.frm_main.depart.value!='') html+= "/" + document.frm_main.depart.value;
					}
					html += "<br>固话：" + document.frm_main.tel.value;
					if(document.frm_main.telext.value!="") html += " 转 " + document.frm_main.telext.value;
					html += '/ 手机：<font class="Tmobile">' + document.frm_main.mobile.value + "</font>";
					html += '<br><span class="x_sel2" id="id_dispatch_' + jscartlist.info_id + '">起送价：' + kj.obj("#id_dispatch_0").innerHTML + '</span>';
					html += '&nbsp;&nbsp;&nbsp;&nbsp;<span class="x_sel2" id="id_addprice_' + jscartlist.info_id + '">配送费：' + kj.obj("#id_addprice_0").innerHTML + '</span>';
					kj.set("#id_info_base"+jscartlist.info_id , "innerHTML" , html);
					jscartlist.info_cancel(true);
					jscartlist.refresh_price();
				}else{
					if("msg" in obj_data){
						kj.alert(obj_data.msg);
					}else{
						kj.alert("操作失败");
					}
				}
			}
		});
	}
	this.select_sel = function(obj,val) {
		var is_sel = false;
		for(var i = 0 ; i < obj.length; i++) {
			if(obj[i].value == val) {
				obj[i].selected = true;
				is_sel = true;
				break;
			}
		}
		if(!is_sel && obj.length>0 ) obj[0].selected = true;
	}
	//提交定单
	this.submit = function(){
		if(this.info_id>0) {
			alert("请先保存编辑的配送信息");
			return;
		}
		jscartlist.refresh_price();
		var total = kj.toint(kj.obj("#id_shop_total_" + this.shopid).innerHTML);
		var minleast = jscartlist.minleast;
		var shopid = this.shopid;
		if(minleast == 0) minleast = jscartlist.shop_minleast;
		if(total<minleast){
			alert("定餐金额必须达到￥"+minleast+"，才起送");
			return;
		}
		var arr_o=kj.obj(".priceB");
		var obj_row_price = kj.obj(".menu_price");
		for(var i = 0 ; i < obj_row_price.length ; i++ ) {
			if(this.shop_oneminleast>0 && this.shop_oneminleast > kj.toint(obj_row_price[i].innerHTML) )	{
				alert("单份定单价须大于￥" + this.shop_oneminleast+"，才起送");
				return;
			}
		}
		if(document.frm_main.arrive.value=="") {
			alert("请选择送餐时间");
			document.frm_main.arrive.focus();
			return;
		}
		if( this.score_refresh(1,shopid) == false ) return;
		if(kj.obj("#id_new_info_radior").checked) {
			if(this.chk_info() == false) return;
		}
		//取当前购物车值
		var arr_1 = [];
		for(i = 0 ; i < this.cart['id_'+shopid].length ; i++) {
			arr_1[arr_1.length] = this.cart['id_'+shopid][i].join(",");
		}
		if(arr_1.length<1) {
			alert("当前购物车为空，请选好菜品再来下单");
			return false;
		}
		//手机短信验证
		if(this.is_orderverify()) return;
		document.frm_main.cart_ids.value = shopid + ":" + arr_1.join("|");
		document.frm_main.addprice.value = this.minaddprice;
		//关闭提交按钮
		document.frm_main.btn_ok.value="正在提交";
		document.frm_main.btn_ok.disabled=true;
		document.frm_main.btn_ok.className = 'button3x';
		kj.ajax.post(document.frm_main,function(data){
			var obj_data=kj.json(data);
			if(obj_data.isnull) {
				alert("操作失败");
				document.frm_main.btn_ok.value="再试一次";
				document.frm_main.btn_ok.disabled=false;
				document.frm_main.btn_ok.className = 'button3';
			} else {
				if('code' in obj_data && obj_data.code=='0') {
					//清空当前店铺购物车
					var str = kj.cookie_get("cart_ids");
					var arr = [];
					if(str) arr = str.split("||");
					for(i = 0 ; i < arr.length ; i++) {
						arr_2 = arr[i].split(":");
						if(arr_2[0] == jscartlist.shopid) {
							arr.removeat(i);break;
						}
					}
					var str_ids = arr.join("||");
					kj.cookie_set("cart_ids" , str_ids , 24);
					if(kj.cfg("isremote") == '1' && 'state' in obj_data && obj_data.state=='0') {
						kj.alert.show("订餐成功");
                        location.href = "/index.php";
					} else {
						kj.alert.show("订餐成功" , function(){
							location.href = "/index.php";
						});
					}
				}else{
					if("msg" in obj_data){
						alert(obj_data.msg);
					}else{
						alert("下单失败");
					}
					document.frm_main.btn_ok.value="再试一次";
					document.frm_main.btn_ok.disabled=false;
					document.frm_main.btn_ok.className = 'button3';
				}
			}
		});
	}
	//检查用户信息合法性
	this.chk_info = function() {
			for(var i = 0 ; i < this.depth ; i++) {
				x = kj.obj("#id_area_" + i);
				if(x && x.value=="" && x.style.display=='') {
					alert("请选择您所在地区范围");
					x.focus();
					return false;
				}
			}
			if(document.frm_main.louhao1.value=="") {
				alert("请填写您所在的具体位置");
				document.frm_main.louhao1.focus();
				return false;
			}
			if(document.frm_main.name.value=="") {
				alert("请填写收件人信息");
				document.frm_main.name.focus();
				return false;
			}

			if(document.frm_main.mobile.value=='') {
				alert("手机必须填");
				document.frm_main.tel.focus();
				return false;
			}

			return true;
	}
	//当输入积分抵扣，或选择发票时，验证积分
	this.score_refresh = function(type,shopid) {
		if(!shopid) shopid = this.shopid;
		var obj_ticket = kj.obj("#id_ticket")
		var obj_score_input = kj.obj("#id_score_input");
		var oldval = kj.toint(obj_score_input.value);
		obj_score_input.value = oldval;
		var score= oldval * 100;
		var score_ticket = kj.toint(obj_ticket.value);
		var is_ok = true;
		val = this.score - score - score_ticket;
		if(val < 0) {
			if(type == 1) {
				val = this.score - score;
				alert('积分不足');
				obj_ticket.options[0].selected = true;
				obj_ticket.focus();
			} else {
				val = this.score - score_ticket;
				obj_score_input.value = 0;
				obj_score_input.focus();
			}
			is_ok = false;
		} else {
			var arrobj = kj.obj(".id_shop_price_" + shopid);
			var objscore = kj.obj("#id_shop_score_" + shopid);
			var x = kj.toint(arrobj[0].innerHTML)+kj.toint(objscore.innerHTML);
			if( (x - oldval) < 0) {
				obj_score_input.value = x;
				val = this.score - (x*100) - score_ticket;
			}
		}
		kj.obj("#id_my_score").innerHTML = val;
		return is_ok;
	}
	this.score_input = function(shopid) {
		this.score_refresh(0,shopid);
		this.refresh_price(shopid);
	}
	//当输入预付款抵扣
	this.repayment_refresh = function(type , shopid) {
		if(!shopid) shopid = this.shopid;
		var obj_repayment_input = kj.obj("#id_repayment_input");
		var repayment= kj.toint(obj_repayment_input.value);
		obj_repayment_input.value = repayment;
		var is_ok = true;
		val = this.user_repayment - repayment;
		if(val < 0) {
			obj_repayment_input.value = 0;
			val = this.user_repayment;
			obj_repayment_input.focus();
			is_ok = false;
		} else {
			var arrobj = kj.obj(".id_shop_price_" + shopid);
			var objrepayment = kj.obj("#id_shop_repayment_" + shopid);
			var x = kj.toint(arrobj[0].innerHTML)+kj.toint(objrepayment.innerHTML);
			if( (x - repayment) < 0) {
				obj_repayment_input.value = x;
				val = this.user_repayment - x;
			}
		}
		kj.obj("#id_my_repayment").innerHTML = val;
		return is_ok;
	}
	this.repayment_input = function(shopid) {
		this.repayment_refresh(0,shopid);
		this.refresh_price(shopid);
	}
	this.act_where_money = function(total_price) {
		var act_money = 0;
		var obj_val;
		if(this.act_list.length>0) {
			var obj_box = kj.obj('#id_act_' + this.shopid);
			var obj_act,price,val,num;
			for(var i = 0; i < this.act_list.length ; i++) {
				obj_act = kj.obj("#id_act_"+this.shopid+"_"+this.act_list[i]['act_id']);
				obj_val = this.get_act_money(this.act_list[i]['act_id'] , this.act_list[i]['act_method'] , this.act_list[i]['act_method_val'] , total_price);
				if(this.act_list[i]['act_where'] == '1') {//达到指定金额
					if(this.act_list[i]['where_val']<=total_price) {
						if(!obj_act) {
						    obj_act=document.createElement("li");
							obj_act.id="id_act_"+this.shopid+"_"+this.act_list[i]['act_id'];
							obj_act.innerHTML = this.act_list[i]['act_name'] + "<input type='hidden' name='act_money[]' value='"+obj_val.money+"' id='id_act_money_"+this.act_list[i]['act_id']+"' extscore='{add:" + obj_val.addscore + ",bei:"+obj_val.beiscore+"}'><input type='hidden' name='shop_act_id[]' value='"+this.act_list[i]['act_id']+"'>";
							obj_box.appendChild(obj_act);
						} else {
							kj.set("#id_act_money_"+this.act_list[i]['act_id'],"value",obj_val.money);
						}
					} else {
						if(obj_act) kj.remove(obj_act);//移除
					}
				} else if(this.act_list[i]['act_where'] == '3' || this.act_list[i]['act_where'] == '4') {//指定数量 或 指定时间指定数量
					num = this.get_allnum();
					if(this.act_list[i]['where_val']<=num) {
						if(!obj_act) {
						    obj_act=document.createElement("li");
							obj_act.id="id_act_"+this.shopid+"_"+this.act_list[i]['act_id'];
							obj_act.innerHTML=this.act_list[i]['act_name'] + "<input type='hidden' name='act_money[]' value='"+obj_val.money+"' id='id_act_money_"+this.act_list[i]['act_id']+"' extscore='{add:" + obj_val.addscore + ",bei:"+obj_val.beiscore+"}'><input type='hidden' name='shop_act_id[]' value='"+this.act_list[i]['act_id']+"'>";
							obj_box.appendChild(obj_act);
						} else {
							kj.set("#id_act_money_"+this.act_list[i]['act_id'],"value",obj_val.money);
						}
					} else {
						if(obj_act) kj.remove(obj_act);//移除
					}
				} else if(this.act_list[i]['act_where'] == '2') {//指定时间
					if(!obj_act) {
						obj_act=document.createElement("li");
						obj_act.id="id_act_"+this.shopid+"_"+this.act_list[i]['act_id'];
						obj_act.innerHTML=this.act_list[i]['act_name'] + "<input type='hidden' name='act_money[]' value='"+obj_val.money+"' id='id_act_money_"+this.act_list[i]['act_id']+"' extscore='{add:" + obj_val.addscore + ",bei:"+obj_val.beiscore+"}'><input type='hidden' name='shop_act_id[]' value='"+this.act_list[i]['act_id']+"'>";
						obj_box.appendChild(obj_act);
					} else {
						kj.set("#id_act_money_"+this.act_list[i]['act_id'],"value",obj_val.money);
					}
				}
				if(this.act_list[i]['act_where'] == '4' || this.act_list[i]['act_where'] == '2') {
					val = 'id_'+ this.act_list[i]['act_id'];
					if(!this.timeout[val]) this.timeout[val] = setTimeout("jscartlist.cancel_time_act("+this.act_list[i]['act_id']+");",this.act_list[i]['time']);
				}
			}
		}
		var obj_price = kj.obj(":act_money[]");
		for(i = 0;i<obj_price.length;i++) {
			act_money+=kj.toint(obj_price[i].value);
		}
		if(kj.obj("#id_shop_act_" + this.shopid)) kj.obj("#id_shop_act_" + this.shopid).innerHTML = act_money;
	}
	this.cancel_time_act = function(act_id) {
		for(var i = 0; i < this.act_list.length ; i++) {
			if(this.act_list[i]['act_id'] == act_id) {
				this.act_list.removeat(i);
				kj.alert.show("超过时间取消【"+this.act_list[i]['act_name']+"】优惠");
			}
		}
		kj.remove("#id_act_"+this.shopid+"_"+act_id);
		this.refresh_price();
	}
	this.get_act_money = function(id , method , method_val, total_price) {
		var money = 0;
		var objact = {'money':0,'addscore':0,'beiscore':0};
		switch(method) {
			case 3://送指定积分
				objact.addscore = method_val;
				break;
			case 4://积分翻倍
				objact.beiscore = method_val;
				break;
			case 2://打折
				objact.money = total_price-kj.toint(total_price*kj.toint(method_val)/10);
				break;
			case 5://立减多少
				objact.money = kj.toint(method_val);
				break;
			case 6://每份优惠多少
				var num = this.get_allnum();
				objact.money = kj.toint(method_val) * num;
				break;
		}
		return objact;
	}
	//地区下拉发生改变时触发
	this.changearea = function(val , index , defautval) {
		var obj,i,ii;
		index++;
		//当index大于深度时跳出
		if(index > this.depth) {
			this.refresh_area_val();
			return;
		}
		//发生改变后，重置之后的地区下拉
		for(i = index ; i < this.depth; i++) {
			obj = kj.obj("#id_area_" + i);
			if(!obj) break;
			obj.options.length = 0;
			if(i>index) {
				if(kj.obj("#id_area_" + i)) kj.obj("#id_area_" + i).style.display = 'none';
			}
		}
		var key = "id_" + val;
		if(val!='') {
			var key2 = key;
			this.minleast = this.shop_minleast;
			this.minaddprice = this.addprice;
			for(i = 0; i <10 ;i++) {
				if(key2 in this.areainfo) {
					if(kj.toint(this.areainfo[key2]["price"])>0 && kj.toint(this.areainfo[key2]["addprice"])>0) {
						this.minaddprice = this.areainfo[key2]["addprice"];
						this.minleast = this.areainfo[key2]["price"];
						break;
					} else if(this.areainfo[key2]["price"]>0) {
						this.minleast = this.areainfo[key2]["price"];
						break;
					} else if(this.areainfo[key2]["addprice"]>0) {
						this.minaddprice = this.areainfo[key2]["addprice"];
						break;
					}
				}

				if(key2 in this.areainfo && 'pid' in this.areainfo[key2] && this.areainfo[key2]["pid"]) {
					key2 = "id_" + this.areainfo[key2]["pid"];
				}
			}
		}
		kj.obj("#id_dispatch_0").innerHTML = this.minleast;
		kj.obj("#id_addprice_0").innerHTML = this.minaddprice;
		if(!(key in this.arealist) || !("length" in this.arealist[key]) || !kj.obj("#id_area_" + index)) {
			//跳出则刷新当前地区值
			if(kj.obj("#id_area_" + index)) kj.obj("#id_area_" + index).style.display = 'none';
			this.refresh_area_val();
			return;
		}
		kj.add_option("#id_area_" + index , '' , '');
		for(i = 0 ; i < this.arealist["id_"+val].length ; i++ ) {
			obj = kj.obj("#id_area_" + index);
			ii = this.arealist["id_"+val][i];
			if( !("id_" + ii in this.areainfo ) ) continue;
			kj.add_option(obj , this.areainfo["id_" + ii]["name"] , ii);
			//选中默认值
			if(obj.options[i+1].value == defautval) {
				obj.options[i+1].selected=true;
			}
		}
		if(kj.obj("#id_area_" + index)) kj.obj("#id_area_" + index).style.display = '';
		this.changearea(obj.value , index , defautval);
	}
	this.refresh_area_val = function() {
		var obj = kj.obj(":info_area_id[]");
		var arr_id = [];
		var arr_val = [];
		var val = '';
		var id = 0;
		for(var i = 0 ; i < obj.length ; i++) {
			if(obj[i].value != '') {
				if( !("id_" + obj[i].value in this.areainfo ) ) continue;
				arr_id[arr_id.length] = obj[i].value;
				val = ( 'val' in this.areainfo["id_" + obj[i].value] ) ? this.areainfo["id_" + obj[i].value]['val'] : this.areainfo["id_" + obj[i].value]['name'];
				arr_val[arr_val.length] = val;
			} else {
				break;
			}
		}
		if(arr_id.length>0) {
			kj.obj("#id_area_id").value = arr_id[arr_id.length-1];
		} else {
			kj.obj("#id_area_id").value = '';
		}
		kj.obj("#id_area_allid").value = arr_id.join(",");
		kj.obj("#id_area").value = arr_val.join(" ");
		if(this.info_id==0) {
			this.refresh_price();
		}
	}
	//改变数量
	this.change_num = function(id , num) {
		var obj_cart_num = kj.obj(id);
		val = kj.toint(obj_cart_num.value);
		if(num) {
			val+=kj.toint(num);
			if(val<1) return;
			obj_cart_num.value = val;
		    this.sendcartnum(id, num);
		} else {
            this.sendcartnum(id, val);
        }
		num = kj.toint(obj_cart_num.value);
		var shopid = "id_" + this.shopid;
		var key = id.replace('#id_num_','');
		for(var i = 0 ; i < this.cart[shopid].length ; i++) {
			x = this.cart[shopid][i].join("_");
			if(x == key) {
				this.cart[shopid].removeat(i);
				i--;
			}
		}
		for(i = 0 ; i < num ;i++) {
			this.cart[shopid][this.cart[shopid].length] = key.split("_");
		}
		if(obj_cart_num) {
			var obj_num = kj.obj("#id_shop_" + this.shopid + " input<<name,/^menunum/i");
			var obj_list = kj.obj("#id_shop_" + this.shopid + " .x_list1");
			var index = kj.index(obj_num , obj_cart_num);
			this.refresh_price('' , obj_list[index]);
		}
	}
	this.get_allnum = function() {
		var obj_num = kj.obj("#id_shop_" + this.shopid + " input<<name,/^menunum/i");
		var num = 0;
		for(var i = 0 ; i <obj_num.length ; i++ ) {
			num += kj.toint(obj_num[i].value);
		}
		return num;
	}
	this.info_seldefault = function(allid) {
		if(!allid || allid=='') return;
		var arr = allid.split(",");
		//加载默认值选中
		this.select_sel(kj.obj("#id_area_0") , arr[0]);
		for(var i=0 ; i < arr.length ; i++) {
			//if(arr.length-1<=i) break;
			this.changearea(arr[i],i,arr[i+1]);
		}
		if(arr.length<2) this.refresh_area_val();
	}
	this.insert_beta = function(val) {
		if(kj.obj('#id_beta').value=='') {
			kj.textarea_insertstr('#id_beta',val);}else{kj.textarea_insertstr('#id_beta','，'+val);
		}
		this.beta_keyup();
	}
	this.beta_keyup = function() {
		var val = kj.obj("#id_beta").value;
		var len = 30-val.length;
		if(len<=0) {
			kj.obj("#id_beta").value = val.substr(0,30);
			len = 0;
		}
		kj.obj("#id_beta_num").innerHTML = len;
	}
	//更新购物车
	this.save_cookie = function(isunload) {
		//取当前购物车值
		var arr_1 = [];
		var shopid = this.shopid;
		for(i = 0 ; i < this.cart['id_'+shopid].length ; i++) {
			arr_1[arr_1.length] = this.cart['id_'+shopid][i].join(",");
		}
		if(!isunload && arr_1.length<1) {
			alert("当前购物车为空，请选好菜品再来下单");
			return false;
		}
		var cartids = this.shopid + ":" + arr_1.join("|");
		var str = kj.cookie_get("cart_ids");
		var arr = [];
		if(str) arr = str.split("||");
		for(i = 0 ; i < arr.length ; i++) {
			arr_2 = arr[i].split(":");
			if(arr_2[0] == jscartlist.shopid) {
				arr[i] = cartids;break;
			}
		}
		var str_ids = arr.join("||");
		kj.cookie_set("cart_ids" , str_ids , 24);
	}
	this.sendsms = function() {
		var tel = kj.obj("#id_orderverify_tel").innerHTML;
		kj.ajax.get(kj.cfg('baseurl') + "/common.php?app=sys&app_act=send.sms&tel="+tel+"&type=4" , function(data) {
			var obj = kj.json(data);
			if(obj.isnull) return;
			if(obj.code != 0) {
				kj.alert(obj.msg);
				return;
			}
			kj.hide("#id_order_info1");
			kj.show("#id_order_info2");
			jscartlist.timer = 120;
			jscartlist.starttime(true);
		});
	}
	this.starttime = function(isstart) {
		var obj = kj.obj("#id_orderverify_timer");
		if(!obj) return;
		var timer = kj.toint(obj.innerHTML);
		//if(timer <= 0) timer = this.timer;
		timer--;
		if(isstart) timer = this.timer;
		if(timer<0) {
			kj.hide("#id_orderverify_timers");
			kj.show("#id_orderverify_resend");
		} else {
			obj.innerHTML = timer;
			setTimeout('jscartlist.starttime()' , 1000);
		}
	}
	this.resendsms = function() {
		kj.show('#id_order_info1');
		kj.hide('#id_order_info2');
		kj.show("#id_orderverify_timers");
		kj.hide("#id_orderverify_resend");
	}
	this.verfiysms = function() {
		var val = kj.obj("#id_orderverify_code").value;
		var tel = kj.obj("#id_orderverify_tel").innerHTML;
		kj.ajax.get(kj.cfg('baseurl') + "/common.php?app=sys&app_act=verify.sms&tel="+tel+"&type=4&key=" + val , function(data) {
			var obj = kj.json(data);
			if(obj.isnull) return;
			if(obj.code != 0) {
				kj.alert(obj.msg);
			} else {
				jscartlist.verifytel = kj.obj("#id_orderverify_tel").innerHTML;
				var info_id = kj.radio(document.frm_main.area_select).value;
				kj.dialog.close("#winverifytel");
				if(info_id == 0) {
					jscartlist.submit();
				} else {
					jscartlist.info_save();
				}
			}
		});
	}
	this.is_orderverify = function() {
		if(this.order_verify==0) return false;
		var tel = document.frm_main.mobile.value;
		if(this.verifytel == tel || tel == '' ) return false;
		//已验证则不需要再验了
		var arr = kj.obj("#id_address_info .Tmobile");
		var arrtel = [];
		for(var i = 0 ; i < arr.length ; i++) {
			arrtel[arrtel.length] = arr[i].innerHTML;
		}
		if(arrtel.indexOf(tel)>=0) return false;
		var obj = kj.obj('#id_order_verify');
		if(obj) {
			this.verifycode_html = obj.innerHTML;
			kj.remove(obj);
		}
		kj.dialog({'html':this.verifycode_html,'id':'verifytel','type':'html','title':'手机验证','w':330,'showbtnmax':false,'showbtnhide':false});
		kj.obj("#id_orderverify_tel").innerHTML = tel;
		return true;
	}
}

window.onbeforeunload = function() {
	jscartlist.save_cookie(true);
}