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
  Sequelize} from 'sequelize';
import { Comments } from './comments';
 // import { sequelize } from './index';
import { Likes } from './likes';
import { RecentSearchs } from './recentsearchs';
import { Tags } from './tags';
import { Users } from './users';

  export interface IpostsAttributes {
    id: number,
    content: string,
    userId: number,
    public: boolean,
    createdAt: Date,
    updatedAt: Date
  }

export type postsPk = "id";
export type postsId = Posts[postsPk];
export type postsOptionalAttribues = 
"id" 
| "content" 
| "userId"
| "public"
| "createdAt"
| "updatedAt"; 
export type postsCreationAttributes = Optional<IpostsAttributes,postsOptionalAttribues>

  export class Posts extends Model<IpostsAttributes, postsCreationAttributes> implements IpostsAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     public readonly id!: number;
     public content!: string;
     public userId!: number;
     public public!: boolean;
   
     public readonly createdAt!: Date;
     public readonly updatedAt!: Date;

     public static associations: {
      postsbelongsToUsers: Association<Posts, Users>,
      postshasManyComment:Association<Posts, Comments>
      postsHasManyLikes:Association<Posts, Likes>
      postsbelongsToManyTags:Association<Posts, RecentSearchs>
    }
    static initModel(sequelize: Sequelize): typeof Posts {
      Posts.init({
        id: {
          autoIncrement:true,
          type: DataTypes.BIGINT,
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
        public: {
          type: DataTypes.BOOLEAN,
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
        modelName: 'posts',
        tableName: 'posts',
        freezeTableName: true,
        timestamps: false,
        //createdAt: 'createAt',
        //updatedAt: false
      });
      return Posts;
    }
  };
  
  

  Posts.belongsTo(Users, {
    foreignKey: 'userId',
    targetKey: 'id',
    //sourceKey: 'id',
    onDelete: 'CASCADE',
    as: 'postsbelongsToUsers',
  });
  Posts.hasMany(Comments, {
    foreignKey: 'postId',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    as: 'postshasManyComment'
  });
  Posts.hasMany(Likes, {
    foreignKey: 'postId',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    as: 'postsHasManyLikes'
  });
  Posts.belongsToMany(Tags, {
    foreignKey: 'postId',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    through: 'post_tag',
    as: 'postsbelongsToManyTags'
  });