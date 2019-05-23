const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const {isLoggedIn,isNotLoggedIn }=require('./middlewares');
const {User}=require('../models');
//router.get(미들웨어1,2,3)
const router = express.Router();


router.post('/join',isNotLoggedIn,async (req,res,next)=>{
    const {email,nick,password}=req.body;
    try{
        const exUser = await User.find({where:{email}});
        if(exUser){
            req.flash('joinError','이미 가입된 이메일 입니다.');
            return res.redirect('/join');
        }
        await bcrypt.genSalt(10,(err,salt)=>{
            if(err){
                console.log('bcrypt.genSalt() error:',err.message);
            }else{
                bcrypt.hash(password,salt,null,(err,hash)=>{
                    if(err){console.log(err.message);}
                    else{
                        User.create({
                            email,
                            nick,
                            password: hash,
                        });
                }
                });
            }
        })//bcrypt로 암호화한다. 두번째 매개변수를 암호화시간
        return res.redirect('/');
    }catch(error){
        console.error(error);
        next(error);
    }
});
//join페이지에서 일단 로그인이 되었는지 안되었는지 확인한뒤에 로그인이 안되어 있으면 회원가입 절차시작


router.post('/login', isNotLoggedIn,(req, res, next) => {//req.body.email,req.body.password
    passport.authenticate('local',(authError,user,info)=>{ //이것도 위 done과 같이 에러,성공,실패로 담길수있다.
        if(authError){
            console.error(authError);
            return next(authError);
        }
        if (!user) {//사용자 정보가 없으면
            req.flash('loginError 사용자 정보 없음');
            return res.redirect('/');
        }
        return req.login(user, (loginError) => {   // 성공했을때 사용자 정보찾을때req.user
            if(loginError){ //이건 에러가 터질수가 없으나 혹시나 해서 하는거임.
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req,res,next);
});


router.get('/logout',isLoggedIn,(req,res)=>{
    req.logout();   //로그아웃 시킨다.
    req.session.destroy(); //세션까지 지운다
    res.redirect('/'); //메인페이지로
})
//(1)
router.get('/kakao',passport.authenticate('kakao'));

//(2) (3)번은 kakaostrategy.js
router.get('/kakao/callback',passport.authenticate('kakao',{
    failureRedirect:'/',
}),(req,res)=>{
    res.redirect('/');
});
module.exports = router;