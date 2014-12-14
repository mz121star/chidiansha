<?php
namespace Home\Controller;

class IndexController extends BaseController {

    public function indexAction(){
        $food = M('food');
        $fav = M('fav');
        $foodresult = $food->field('food_id,food_name,food_adddate,food_qishu,food_image')->order('food_adddate desc')->select();
        $foodlist = array();
        foreach ($foodresult as $value) {
            $favcount = $fav->where('favfood_id = "'.$value['food_id'].'"')->count();
            $value['favcount'] = $favcount;
            $foodlist[] = $value;
        }
        $this->assign('foodlist', $foodlist);
        $this->display();
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
            $status = 1;
        } else {
            $status = 0;
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
