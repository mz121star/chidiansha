<?php

class FoodAction extends PublicAction {

    public function lists(){
        $food = M("Food");
        import('ORG.Util.Page');
        $userid = $this->userInfo['user_id'];
        $usertype = $this->userInfo['user_type'];
        if ($usertype == 1) {
            $count = $food->count();
            $page = new Page($count, 10);
            $foodlist = $food->field('id,food_name,food_price')->order(array('id'=>'desc'))->limit($page->firstRow.','.$page->listRows)->select();
        } else {
            $count = $food->where('user_id="'.$userid.'"')->count();
            $page = new Page($count, 10);
            $foodlist = $food->where('user_id="'.$userid.'"')->field('id,food_name,food_price')->order(array('id'=>'desc'))->limit($page->firstRow.','.$page->listRows)->select();
        }
        $show = $page->show();
        $this->assign('page',$show);
        $this->assign('foodlist', $foodlist);
        $this->display();
    }

    public function showadd(){
        $usertype = $this->userInfo['user_type'];
        if ($usertype == 1) {
            $this->redirect('Food/lists');
        }
        $userid = $this->userInfo['user_id'];
        $shop = M("Shop");
        $type = $shop->field('shop_type')->where('user_id="'.$userid.'"')->find();
        $shoptype = M("Shoptype");
        $typelist = $shoptype->where('parent_id = '.$type['shop_type'])->order(array('id'=>'desc'))->select();
        $this->assign('typelist', $typelist);
        $this->display();
    }
    
    public function modfood() {
        $foodid = $this->_get('foodid');
        $userid = $this->userInfo['user_id'];
        $food = M("Food");
        $foodinfo = $food->where('id='.$foodid.' and user_id="'.$userid.'"')->find();
        if (!$foodinfo) {
            $this->redirect('Food/lists');
        }
        $this->assign('foodinfo', $foodinfo);

        $shop = M("Shop");
        $type = $shop->field('shop_type')->where('user_id="'.$userid.'"')->find();
        $shoptype = M("Shoptype");
        $typelist = $shoptype->where('parent_id = '.$type['shop_type'])->order(array('id'=>'desc'))->select();
        $this->assign('typelist', $typelist);
        $this->display();
    }
    
    public function delfood(){
        $foodid = $this->_get('foodid');
        $userid = $this->userInfo['user_id'];
        $usertype = $this->userInfo['user_type'];
        $food = M("Food");
        if ($usertype == 1) {
            $foodnumber = $food->where('id='.$foodid)->delete();
            $this->redirect('Food/lists');
        }
        $foodinfo = $food->where('id='.$foodid.' and user_id="'.$userid.'"')->find();
        if ($foodinfo) {
            $foodnumber = $food->where('id='.$foodid.' and user_id="'.$userid.'"')->delete();
            if ($foodnumber) {
                unlink('./upload/'.$foodinfo['food_image']);
                $this->redirect('Food/lists');
            } else {
                $this->error("删除菜品失败", 'lists');
            }
        } else {
            $this->error("删除菜品失败", 'lists');
        }
    }

    public function save(){
        $userid = $this->userInfo['user_id'];
        $isdelimage = $this->_post('delfood_image');
        if ($isdelimage) {
            $_POST['food_image'] = '';
            unlink('./upload/'.$isdelimage);
        }
        if ($_FILES['food_image']['name']) {
            import('ORG.Net.UploadFile');
            $upload = new UploadFile();
            $upload->maxSize = 3145728;//3M
            $upload->allowExts = array('jpg', 'gif', 'png', 'jpeg');
            $upload->savePath = './upload/';
            if(!$upload->upload()) {
                $this->error($upload->getErrorMsg());
            }else{
                $info = $upload->getUploadFileInfo();
            }
            $_POST['food_image'] = $info[0]['savename'];
        }
        $food = M("Food");
        $post = $this->filterAllParam('post');
        if (!isset($post['food_top'])) {
            $post['food_top'] = "0";
        }
        $post['user_id'] = $userid;
        if (isset($post['id']) && $post['id']) {
            $foodnumber = $food->where('id='.$post['id'].' and user_id="'.$userid.'"')->save($post);
        } else {
            $foodid = $food->add($post);
        }
        $this->redirect('Food/lists');
    }
}