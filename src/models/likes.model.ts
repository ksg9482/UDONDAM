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

export interface IlikesAttributes {
  id?: number,
  userId: number,
  postId: number,
  //createdAt: Date,
  //updatedAt: Date
}

// export type likesPk = "id";
// export type likesId = Likes[likesPk];
// export type likesOptionalAttribues = 
// "id" 
// | "userId" 
// | "postId"
// | "createdAt"
// | "updatedAt"; 
// export type likesCreationAttributes = Optional<IlikesAttributes,likesOptionalAttribues>


export class Likes extends Model<IlikesAttributes> {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  public static readonly id?: number;
  public static userId?: number;
  public static postId?: number;

  //public readonly createdAt?: Date;
  //public readonly updatedAt?: Date;

  public static associations: {
    userHasManyLike: Association<Users, Likes>
    likesBelongsToUsers: Association<Likes, Users>,

    postsHasManyLikes:Association<Posts, Likes>
    likesBelongsToPosts: Association<Likes, Posts>,
  };


};

//static initModel(sequelize: Sequelize): typeof Likes {
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
  },
  // createdAt:{
  //   type: DataTypes.DATE,
  //   allowNull: false
  // },
  // updatedAt:{
  //   type: DataTypes.DATE,
  //   allowNull: false
  // }
}, {
  sequelize,
  tableName: 'likes',
  modelName: 'likes',
  freezeTableName: true,
  timestamps: true,
    //createdAt: true,
    updatedAt: 'updatedAt'
});
// return Likes; 
// };

Users.hasMany(Likes, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyLike'
});
Likes.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  //sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'likesBelongsToUsers',
});



Posts.hasMany(Likes, {
  foreignKey: 'postId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'postsHasManyLikes'
});
Likes.belongsTo(Posts, {
  foreignKey: 'postId',
  targetKey: 'id',
  //sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'likesBelongsToPosts',
});
