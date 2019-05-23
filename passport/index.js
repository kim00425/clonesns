const local = require('./localStrategy');   //직접이메일 로그인
const kakao = require('./kakaoStrategy');   //카카오 로그인
const {User} =require('../models');


//시리얼라이즈,디시리얼라이즈 설명.txt참조
module.exports = (passport)=>{
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    //req.user를 수정하고 싶다면 deserializeUser에서 수정
    passport.deserializeUser((id, done) => {
        User.find({
            where: { id },
            include:[{
                model:User,
                attributes:['id','nick'],
                as: 'Followers', //model index에서 설정
            },{
                model:User,
                attributes:['id','nick'],
                as:'Followings',    //model index에서 설정
            }],
        })
            .then(user => done(null, user))
            .catch(err => done(err));
    });
    local(passport);
    kakao(passport);
};