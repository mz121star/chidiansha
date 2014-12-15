<?php
namespace Admin\Controller;

class IndexController extends BaseController {

    public function indexAction(){
        $this->display();
    }

    public function loginAction() {
        $this->display();
    }

    public function dologinAction(){
        $userobj = M("user");
        $user_pw = I('post.user_pw');
        $data['user_id'] = I('post.user_id');
        $data['user_pw'] = md5($user_pw);
        $data['user_status'] = 1;
        $userInfo = $userobj->field('user_pw', true)->where($data)->find();
        if(!empty($userInfo)){
            session('userinfo', $userInfo);
            $this->success('登录成功', 'index');
        } else {
            $this->error('登录失败', 'login');
        }
    }

    public function logoutAction() {
        $userInfo = session('userinfo');
        if(!empty($userInfo)){
            session('userinfo', null);
        }
        $this->redirect('Index/login');
    }

    public function jxhdAction() {
        $jxhd = M("jxhd");
        $count = $jxhd->count();
        $page = new \Think\Page($count, 10);
        $jxhdlist = $jxhd->order(array('jxhd_date'=>'desc'))->limit($page->firstRow.','.$page->listRows)->select();
        $show = $page->show();
        $this->assign('page',$show);
        $this->assign('jxhdlist', $jxhdlist);
        $this->display();
    }

    public function addjxhdAction() {
        $this->display();
    }

    public function modjxhdAction() {
        $hdid = I('get.hdid');
        $jxhd = M("jxhd");
        $jxhdinfo = $jxhd->where('jxhd_id="'.$hdid.'"')->find();
        if (!$jxhdinfo) {
            $this->error("活动不存在");
        }
        $this->assign('jxhdinfo', $jxhdinfo);
        $this->display();
    }

    public function deljxhdAction() {
        $hdid = I('get.hdid');
        $jxhd = M("jxhd");
        $jxhdinfo = $jxhd->where('jxhd_id="'.$hdid.'"')->find();
        if ($jxhdinfo) {
            $jxhdnumber = $jxhd->where('jxhd_id="'.$hdid.'"')->delete();
            if ($jxhdnumber) {
                unlink('./upload/'.$jxhdinfo['jxhd_image']);
                $this->success('删除活动成功');
            } else {
                $this->error("删除活动失败");
            }
        } else {
            $this->error("删除活动失败");
        }
    }

    public function savejxhdAction() {
        $isdelimage = I('post.deljxhd_image');
        if ($isdelimage) {
            $_POST['jxhd_image'] = '';
            unlink('./upload/'.$isdelimage);
        }
        if ($_FILES['jxhd_image']['name']) {
            $upload = new \Think\Upload();
            $upload->maxSize = 3145728;//3M
            $upload->exts = array('jpg', 'gif', 'png', 'jpeg');
            $upload->rootPath = './upload/';
            $uploadinfo = $upload->uploadOne($_FILES['jxhd_image']);
            if(!$uploadinfo) {
                $this->error($upload->getError());
            }
            $_POST['jxhd_image'] = $uploadinfo['savepath'].$uploadinfo['savename'];
        }
        $jxhd = M("jxhd");
        $post = filterAllParam('post');
        if (isset($post['jxhd_id']) && $post['jxhd_id']) {
            unset($post['deljxhd_image']);
            $foodid = $jxhd->where('jxhd_id="'.$post['jxhd_id'].'"')->save($post);
        } else {
            $post['jxhd_date'] = date('Y-m-d H:i:s');
            $foodid = $jxhd->add($post);
        }
        if ($foodid) {
            $this->success('保存活动成功', 'jxhd');
        } else {
            $this->error("保存活动失败");
        }
    }
}