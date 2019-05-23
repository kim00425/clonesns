const express =require('express');
const router = express.Router();
const {Post,User} =require('../models');
const {isLoggedIn,isNotLoggedIn}=require('./middlewares');
//프로필페이지  pug 실행 

router.get('/profile',isLoggedIn, (req, res) => {
    res.render('profile', { title: '내 정보 - NodeBird', user: null });
});

//회원가입 페이지   pug 실행    로그인안한사람들 프로필 접근금지하게
router.get('/join',isNotLoggedIn, (req, res) => {
    res.render('join', {
        title: '회원가입 - NodeBird',
        user: req.user,
        joinError: req.flash('joinError'),
    });
});

//메인 페이지   pug 실행
router.get('/', (req, res, next) => {
    Post.findAll({
        include:{
            model:User,
            attributes:['id','nick'],
        },
    })
        .then((posts)=>{
            res.render('main',{
                title:'NodeBird',
                twits:posts,
                user:req.user,
                loginError:req.flash('loginError'),
            });
        })
        .catch((error)=>{
            console.error(error);
            next(error);
        });
});

module.exports = router;