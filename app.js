const express= require('express');
const cookieParser =require('cookie-parser');
const path = require('path');
const session = require('express-session');
const morgan =require('morgan')
const flash = require('connect-flash');
const passport = require('passport');//passport
require('dotenv').config();//8번

const { sequelize } = require('./models');
const passportConfig = require('./passport');//passport
const authRouter = require('./routes/auth');
const pageRouter = require('./routes/page');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');



const app = express();
sequelize.sync();
passportConfig(passport);//passport

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');
app.set('port',process.env.PORT||3306);


app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'public')));//main.css
app.use('/img',express.static(path.join(__dirname, 'uploads')));
//별첨1번 /img/abc.png url과 실제 다운로드된 폴더를 다르게해서 해커로부터 보호
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(cookieParser(process.env.COOKIE_SECRET));//8번
app.use(session({
    resave:false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,//8번
    cookie:{
        httpOnly: true,
        secre:false,
    }
}));

app.use(flash());
app.use(passport.initialize());//passport
app.use(passport.session());//passport

app.use('/', pageRouter);
app.use('/auth',authRouter);
app.use('/post',postRouter);
app.use('/user',userRouter);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});



app.listen(app.get('port'),()=>{
    console.log(`${app.get('port')} port use`);
});