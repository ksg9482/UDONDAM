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
  import  sequelize  from './index';
import { Posts } from './posts.model';
import { Tags } from './tags.model';

  export interface Iposts_tagsAttributes {
    id: number,
    postId: number,
    tagId: number,
   //createdAt: Date,
   //updatedAt: Date
  }

// export type posts_tagsPk = "id";
// export type posts_tagsId = Posts_Tags[posts_tagsPk];
// export type posts_tagsOptionalAttribues = 
// "id" 
// | "postId" 
// | "tagId"
// | "createdAt"
// | "updatedAt"; 
// export type posts_tagsCreationAttributes = Optional<Iposts_tagsAttributes,posts_tagsOptionalAttribues>



export class Posts_Tags extends Model<Iposts_tagsAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

     public readonly id?: number;
     public postId?: number;
     public tagId?: number;
 
     //public readonly createdAt?: Date;
     //public readonly updatedAt?: Date;

     public static associations: {
      postsbelongsToManyTags:Association<Posts, Tags>
      tagsbelongsToManyPosts: Association<Tags, Posts>,
     };
    
     
  };
  //static initModel(sequelize: Sequelize): typeof Posts_Tags {
    Posts_Tags.init({
      id: {
        autoIncrement:true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tagId: {
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
      modelName: 'post_tag',
      tableName: 'post_tag',
      freezeTableName: true,
      timestamps: true,
    //createdAt: true,
    updatedAt: 'updatedAt'
    });
  //   return Posts_Tags;
  //  };

  Tags.belongsToMany(Posts, {
    through: 'post_tag',
    sourceKey: 'id',
    foreignKey: 'tagId',
    onDelete: 'CASCADE',
    as: 'tagsbelongsToManyPosts'
  });
   Posts.belongsToMany(Tags, {
      foreignKey: 'postId',
      sourceKey: 'id',
      onDelete: 'CASCADE',
      through: 'post_tag',
      as: 'postsbelongsToManyTags'
    });

