import {
  DataTypes,
  Model,
  Association
} from 'sequelize';
import sequelize from './index';
import { Posts } from './posts.model';
import { Users } from './users.model';

export interface IlikesAttributes {
  id?: number,
  userId: number,
  postId: number
};

export class Likes extends Model<IlikesAttributes> {

  readonly id?: number;
  userId?: number;
  postId?: number;

  public static associations: {
    userHasManyLikes: Association<Users, Likes>
    likesBelongsToUser: Association<Likes, Users>,

    postHasManyLikes: Association<Posts, Likes>
    likesBelongsToPost: Association<Likes, Posts>,
  };
};

Likes.init({
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'likes',
  modelName: 'likes',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updatedAt'
});

Users.hasMany(Likes, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyLikes'
});
Likes.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'likesBelongsToUser',
});



Posts.hasMany(Likes, {
  foreignKey: 'postId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'postHasManyLikes'
});
Likes.belongsTo(Posts, {
  foreignKey: 'postId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'likesBelongsToPost',
});
