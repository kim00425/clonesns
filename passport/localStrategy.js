const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');

const { User } = require('../models');
module.exports =(passport)=>{
    passport.use(new LocalStrategy({
        usernameField:'email',  //req.body.email뜻함
        passwordField:'password',   //req.body.password 뜻함
    },async(email,password,done)=>{ //위의 내용이 맞아서 성공하면 이게 콜백으로 실행 done(에러,성공,실패) 순으로 매개변수
        try{
            const exUser=await User.find({where:{email}});
            
            if(exUser){//이메일이 있을때
                //비밀번호 검사 시작
                const result = await bcrypt.compareSync(password,exUser.password);
                if(result){ //비밀번호가 맞으면 사용자정보 리턴
                    done(null,exUser);
                }else{  //비밀번호가 틀리면
                    done(null,false,{message:'비밀번호가 일치하지 않습니다.'});
                }
            }else{
                done(null,false,{message:'가입되지 않은 회원입니다'});
            }
        }catch(error){
            console.error(error);
            done.apply(error);
        }
    }));
};
