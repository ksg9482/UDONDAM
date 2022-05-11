import {
  DataTypes,
  Model,
  Optional,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  Association,
  Sequelize
} from 'sequelize';
import sequelize from './index';
import { Posts } from './posts.model';
import { Users } from './users.model';

export interface IcommentsAttributes {
  id: number,
  content: string,
  userId: number,
  postId: number,
  commentId: number,
  createdAt: Date,
  updatedAt: Date
}

// export type commentsPk = "id";
// export type commentsId = Comments[commentsPk];
// export type commentsOptionalAttribues = 
// "id" 
// | "content" 
// | "userId"
// | "postId"
// | "commentId"
// | "createdAt"
// | "updatedAt"; 
// export type commentsCreationAttributes = Optional<IcommentsAttributes,commentsOptionalAttribues>



export class Comments extends Model<IcommentsAttributes>{
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */

  public readonly id!: number;
  public content!: string;
  public userId!: number;
  public postId!: number;
  public commentId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    userHasManyComment:Association<Users, Comments>
    commentsBelongsToUsers: Association<Comments, Users>,

    postshasManyComment:Association<Posts, Comments>
    commentsBelongsToPosts: Association<Comments, Posts>,
  };


};

//static initModel(sequelize: Sequelize): typeof Comments {
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
  //commentId는 왜 필요?? 그냥 id랑 무슨 차이가??
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt:{
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt:{
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'comment',
  freezeTableName: true,
  timestamps: true,
  createdAt: "createAt",
  updatedAt: false
});
//   return Comments;
// };

Users.hasMany(Comments, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyComment'
});
Comments.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  //sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'commentsBelongsToUsers',
});


Posts.hasMany(Comments, {
  foreignKey: 'postId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'postshasManyComment'
});
Comments.belongsTo(Posts, {
  foreignKey: 'postId',
  targetKey: 'id',
  //sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'commentsBelongsToPosts',
});