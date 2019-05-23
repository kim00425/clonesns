const express = require('express');
const multer=require('multer'); //10번
const path = require('path');
const router = express.Router();
const {Post , Hashtag} = require('../models');
const { isLoggedIn } = require('./middlewares');
const {User}=require('../models');
const upload = multer({
    storage:multer.diskStorage({
        destination(req,file,cb){   //destination:파일경로,cb 에러 및 결괏값
            cb(null,'uploads/');
        },
        filename(req, file, cb) {      //filename:파일명,cb(에러,결괏값)
            const ext =path.extname(file.originalname);//여기서는 확장자가 해석이안된다 그래서 확장자값을 다시 불러옴
            cb(null,path.basename(file.originalname,ext)+new Date().valueOf+ext);
             //파일명 중복을 막기위해서 시간값까지 같이넣어서 파일로 저장함
        
        },
    }),
    limit:{filesSize : 5*1024*1024},
})
router.post('/img',isLoggedIn,upload.single('img'), (req, res) => {
/*
single:이미지하나
array:이미지 여러개
fields:이미지 여러개
none:이미지 X
*/
    console.log(req.file);//req.file에 저장되어 있음 보통은 body인데 이미지 multer는 file
    res.json({url:`/img/${req.file.filename}`});
    //정적파일 폴더를 사용하므로 app.js에 app.use사용해야한다. app.js 별첨1번 참고
});

const upload2=multer();
router.post('/',isLoggedIn ,upload2.none(), async(req, res,next) => {
    console.log("여기다");
    try{
        const post = await Post.create({
            content: req.body.content,
            img:req.body.url,
            userId:req.user.id,
        });
        const hashtags = req.body.content.match(/#[^\s]*/g);
        if(hashtags){
            const result = await Promise.all(hashtags.map(tag=>Hashtag.findOrCreate({
                where:{title:tag.slice(1).toLowerCase()},
            })));
            await post.addHashtags(result.map(r=>r[0]));
            /*
                A.getB      관계있는 로우 조회
                A.addB      관계생성
                A.setB      관계수정
                A.removeB   관계제거
            */
        }
        res.redirect('/');
    }catch(error){
        console.error(error);
        next(error);
    }
});


//아래는 해쉬태그 검색
router.get('/hashtag',async (req, res,next) => {
    const query = req.query.hashtag;
    if(!query){
        return res.redirect('/');
    }try{
       const hashtag =await Hashtag.find({where : {title:query}});
       let posts =[];
       if(hashtag){
           posts = await hashtag.getPosts({include:[{model:User}]});
       /*
           A.getB      관계있는 로우 조회
           A.addB      관계생성
           A.setB      관계수정
           A.removeB   관계제거
       */
        }
        //main퍼그 렌더링
       return res.render('main',{
           title: `${query} | Nodebird`,
           user:req.user,
           twits:posts,
       });
    }catch(error){
        console.log(error);
        next(error);      
    }
});



module.exports = router;