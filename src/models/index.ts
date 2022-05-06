import { Sequelize } from 'sequelize';
import { config } from '../config/config';

import type {usersAttributes, usersCreationAttributes} from './users';
import type {commentsAttributes, commentsCreationAttributes} from './comments';
import type {likesAttributes, likesCreationAttributes} from './likes';
import type {postsAttributes, postsCreationAttributes} from './posts';
import type {recentSearchsAttributes, recentSearchsCreationAttributes} from './recentsearchs';
import type {tagsAttributes, tagsCreationAttributes} from './tags';
import type {posts_tagsAttributes, posts_tagsCreationAttributes} from './posts_tags';

import { Users } from './users';
import { Comments } from './comments';
import { Likes } from './likes';
import { Posts } from './posts';
import { RecentSearchs } from './recentsearchs';
import { Tags } from './tags';
import { Posts_Tags } from './posts_tags';

export const sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
        host: config.development.host,
        dialect: 'mysql'
    }
    //timezone 추가?
)

export {
    Users,
    Comments,
    Likes,
    Posts,
    RecentSearchs,
    Tags,
    Posts_Tags,
}

export type {
usersAttributes,
commentsAttributes,
likesAttributes,
postsAttributes,
recentSearchsAttributes,
tagsAttributes,
posts_tagsAttributes
}

// export function Sequelize() {
//     Users.initModel(sequelize);
// Comments.initModel(sequelize);
// Likes.initModel(sequelize);
// Posts.initModel(sequelize);
// RecentSearchs.initModel(sequelize);
// Tags.initModel(sequelize);
// Posts_Tags.initModel(sequelize);


// }
// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.js')[env];
// const db:any = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;

// //export = {}
