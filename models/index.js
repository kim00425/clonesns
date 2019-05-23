const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database,config.username,config.password,config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);

db.User.hasMany(db.Post); // 1:N의 관계설정의 경우 순서가 중요 그래서 db.User부터 나와야함
db.Post.belongsTo(db.User);


//다대다는 필요없음
db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });// through는 새로운 테이블이 만들어진다
db.Hashtag.belongsToMany(db.Post,{through:'PostHashtag'});


//팔로우 팔로잉 만들기 테이블이 똑같음 as:매칭모델이름 foreignKey:상대 테이블아이디
db.User.belongsToMany(db.User,{through:'Follow',as :'Followers',foreignKey:'followingId'});
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings', foreignKey: 'followerId'});

db.User.belongsToMany(db.Post, { through: 'Like' });
db.Post.belongsToMany(db.User, { through: 'Like' });

module.exports = db;
