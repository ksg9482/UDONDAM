import {
  DataTypes,
  Model,
  Association
} from 'sequelize';
import sequelize from './index';
import { Posts } from './posts.model';
import { Users } from './users.model';

export interface IcommentsAttributes {
  id?: number,
  content: string,
  userId: number,
  postId: number,
  commentId?: number | null
};

export class Comments extends Model<IcommentsAttributes>{


  public static readonly id?: number;
  public static content?: string;
  public static userId?: number;
  public static postId?: number;
  public static commentId?: number | null;

  public static associations: {
    userHasManyComments: Association<Users, Comments>
    commentsBelongsToUser: Association<Comments, Users>,

    posthasManyComments: Association<Posts, Comments>
    commentsBelongsToPost: Association<Comments, Posts>,
  };


};

Comments.init({
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  }
}, {
  sequelize,
  modelName: 'comments',
  tableName: 'comments',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updatedAt'
});

Users.hasMany(Comments, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyComments'
});
Comments.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'commentsBelongsToUser',
});


Posts.hasMany(Comments, {
  foreignKey: 'postId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'posthasManyComments'
});
Comments.belongsTo(Posts, {
  foreignKey: 'postId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'commentsBelongsToPost',
});