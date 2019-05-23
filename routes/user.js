const express = require('express');
const router = express.Router();
const { isLoggedIn} = require('./middlewares');
const {User} = require('../models');
router.post('/:id/follow',isLoggedIn,async(req,res,next)=>{
    try{
        const user =await User.find({where:{id:req.user.id}});
        //req.user를 수정하고 싶다면 deserializeUser에서 수정
        await user.addFollowing(parseInt(req.params.id,10));
        res.send('success');
    }catch(error)
    {
        console.log(error);
        next(error);
    }
});

module.exports = router;