<?php
namespace Home\Controller;

class IndexController extends BaseController {

    public function sendAction() {
        $userID = I('get.uid');
        $actionto = I('get.ac');
        $userobj = M('user');
        $userinfo = $userobj->field('user_id, user_name, user_regdate, user_image')->where('user_id = "'.$userID.'"')->find();
        if ($userinfo) {
            session('userinfo', $userinfo);
        } else {
            session('userinfo', array('user_id' => $userID, 'user_name'=>'访客'));
        }
        $this->redirect('index/'.$actionto);
    }

    public function indexAction(){
        $order = I('get.order');
        $orderby = 'food_adddate desc';
        if ($order == 'favmost') {
            $orderby = 'food_favcount desc';
        } elseif ($order == 'dif') {
            $orderby = 'food_difficulty desc';
        }
        $food = M('food');
        $fav = M('fav');
        $foodresult = $food->where('food_type = "0"')->field('food_id,food_name,food_adddate,food_qishu,food_image')->order($orderby)->select();
        $foodlist = array();
        foreach ($foodresult as $value) {
            $favcount = $fav->where('favfood_id = "'.$value['food_id'].'"')->count();
            $value['favcount'] = $favcount;
            $foodlist[] = $value;
        }
        $this->assign('foodlist', $foodlist);
        $this->assign('order', $order);
        $this->display();
    }

    public function getjxhdAction() {
        $jxhd = M("jxhd");
        $count = $jxhd->count();
        $page = new \Think\Page($count, 1);
        $jxhdlist = $jxhd->order(array('jxhd_date'=>'desc'))->limit($page->firstRow.','.$page->listRows)->select();
        $jxhdinfo = array();
        if (isset($jxhdlist[0])) {
            $jxhdinfo = $jxhdlist[0];
        }
        echo json_encode($jxhdinfo);
        exit;
    }

    public function jxhdAction() {
        $jxhd = M("jxhd");
        $count = $jxhd->count();
        $page = new \Think\Page($count, 1);
        $jxhdlist = $jxhd->order(array('jxhd_date'=>'desc'))->limit($page->firstRow.','.$page->listRows)->select();
        $jxhdinfo = array();
        if (isset($jxhdlist[0])) {
            $jxhdinfo = $jxhdlist[0];
        }
        $this->assign('jxhdinfo', $jxhdinfo);
        $this->display();
    }
    
    public function jxspAction() {
        $food = M('food');
        $comment = M('comment');
        $foodresult = $food->where('food_type = "1"')->order('food_adddate desc')->select();
        $foodlist = array();
        foreach ($foodresult as $value) {
            $commentcount = $comment->where('commentfood_id = "'.$value['food_id'].'"')->count();
            $value['comcount'] = $commentcount;
            $foodlist[] = $value;
        }
        $this->assign('foodlist', $foodlist);
        $this->display();
    }

    public function zjcsAction() {
        $toupiao = M("toupiao");
        $count = $toupiao->count();
        $page = new \Think\Page($count, 1);
        $votelist = $toupiao->order(array('tp_adddate'=>'desc'))->limit($page->firstRow.','.$page->listRows)->select();
        $voteinfo = array();
        $votefood = array();
        $tpfood = M("tpfood");
        if (isset($votelist[0])) {
            $voteinfo = $votelist[0];
            $votefood = $tpfood->where('tpfood_tpid ="'.$voteinfo['tp_id'].'"')->select();
        }
        $tpuser = M("tpuser");
        $user = $this->userInfo['user_id'];
        $isvote = $tpuser->where('tpuser_tp_id = "'.$voteinfo['tp_id'].'" and tpuser_user_id = "'.$user.'"')->count();
        if ($isvote) {
            $foodresult = $tpfood->where('tpfood_tpid = "'.$voteinfo['tp_id'].'"')->select();
            $foodtotalvote = $tpuser->where('tpuser_tp_id = "'.$voteinfo['tp_id'].'"')->count();
            $foodlist = array();
            foreach ($foodresult as $value) {
                $foodvote = $tpuser->where('tpuser_food_id = "'.$value['tpfood_id'].'"')->count();
                $value['foodvote'] = $foodvote;
                $value['foodvoteperset'] = intval($foodvote/$foodtotalvote*100);
                $foodlist[] = $value;
            }
            $this->assign('foodlist', $foodlist);
            $this->display('tpjg');
        } else {
            $user = $this->userInfo['user_id'];
            $this->assign('voteinfo', $voteinfo);
            $this->assign('votefood', $votefood);
            $this->display();
        }
    }

    public function savetpAction() {
        $post = I('post.');
        if (!count($post['tpuser_food_id'])) {
            $this->error("请选择投票选项");
        }
        $user = $this->userInfo['user_id'];
        $tpuser = M("tpuser");
        foreach ($post['tpuser_food_id'] as $value) {
            $insert = array('tpuser_food_id'=>$value, 'tpuser_user_id'=>$user, 'tpuser_tp_id'=>$post['tpuser_tp_id'], 'tpuser_date'=>date('Y-m-d H:i:s'));
            $tpuser->add($insert);
        }
        
        $tpfood = M("tpfood");
        $foodresult = $tpfood->where('tpfood_tpid = "'.$post['tpuser_tp_id'].'"')->select();
        $foodtotalvote = $tpuser->where('tpuser_tp_id = "'.$post['tpuser_tp_id'].'"')->count();
        $foodlist = array();
        foreach ($foodresult as $value) {
            $foodvote = $tpuser->where('tpuser_food_id = "'.$value['tpfood_id'].'"')->count();
            $value['foodvote'] = $foodvote;
            $value['foodvoteperset'] = intval($foodvote/$foodtotalvote*100);
            $foodlist[] = $value;
        }
        $this->assign('foodlist', $foodlist);
        $this->display('tpjg');
    }

    public function detailAction() {
        $foodid = I('get.foodid');
        $food = M('food');
        $foodinfo = $food->where('food_id = "'.$foodid.'"')->find();
        if (!$foodinfo) {
            $this->error("菜肴不存在");
        }
        $this->assign('foodinfo', $foodinfo);
        $comment = M('comment');
        $commentcount = $comment->where('commentfood_id = "'.$foodid.'"')->count();
        $commentlist = $comment->where('commentfood_id = "'.$foodid.'"')->select();
        $this->assign('commentlist', $commentlist);
        $this->assign('commentcount', $commentcount);
        $this->display();
    }

    public function favfoodAction() {
        $foodid = I('get.foodid');
        $food = M('food');
        $foodinfo = $food->where('food_id = "'.$foodid.'"')->find();
        if (!$foodinfo) {
            echo '菜肴不存在';exit;
        }
        $favobj = M('fav');
        $data['favfood_id'] = $foodid;
        $data['favuser_id'] = $this->userInfo['user_id'];
        $isfav = $favobj->where($data)->count();
        if ($isfav) {
            echo '已经收藏过了';exit;
        }
        $data['fav_date'] = date('Y-m-d H:i:s');
        $favid = $favobj->add($data);
        if ($favid) {
            $food->where('food_id = "'.$foodid.'"')->setInc('food_favcount');;
            echo '收藏成功';exit;
        } else {
            echo '收藏失败';exit;
        }
    }

    public function myfavAction() {
        $favobj = M('fav');
        $food = M('food');
        $data['favuser_id'] = $this->userInfo['user_id'];
        $resultlist = $favobj->where($data)->select();
        $favlist = array();
        foreach ($resultlist as $value) {
            $foodinfo = $food->where('food_id = "'.$value['favfood_id'].'"')->find();
            $favlist[] = $foodinfo;
        }
        $this->assign('favlist', $favlist);
        $this->display();
    }

    public function commentAction() {
        $post = filterAllParam('post');
        $post['commentuser_id'] = $this->userInfo['user_id'];
        $post['commentuser_name'] = $this->userInfo['user_name'];
        $post['comment_date'] = date('Y-m-d H:i:s');
        $comment = M('comment');
        $commentid = $comment->add($post);
        if ($commentid) {
            $this->success('评论成功');
        } else {
            $this->error("评论失败");
        }
    }

    public function eventAction() {
        $fromUserName = I('post.fromUserName');
        $nickname = I('post.nickname');
        $headimgurl = I('post.headimgurl');
        $eventType = I('post.eventType');
        $user = M('user');
        if ($eventType == 'subscribe') {
            $status = '1';
        } else {
            $status = '0';
        }
        $userinfo = $user->where('user_id = "'.$fromUserName.'"')->find();
        if ($userinfo) {
            $result = $user->where('user_id = "'.$fromUserName.'"')->setField('user_status', $status);
        } else {
            $data = array('user_id'=>$fromUserName, 'user_name'=>$nickname, 'user_regdate'=>date('Y-m-d H:i:s'), 'user_image'=>$headimgurl, 'user_status'=>$status);
            $result = $user->add($data);
        }
        return '关注成功';
    }
}
