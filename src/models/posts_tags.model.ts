import {
  DataTypes, 
  Model, 
  Association 
  } from 'sequelize';
  import  sequelize  from './index';
import { Posts } from './posts.model';
import { Tags } from './tags.model';

  export interface Iposts_tagsAttributes {
    id?: number,
    postId: number,
    tagId: number
  };

export class Posts_Tags extends Model<Iposts_tagsAttributes> {
  
     readonly id?: number;
     postId?: number;
     tagId?: number;

     public static associations: {
       postHasManyPosts_Tags:Association<Posts, Posts_Tags>;
       posts_TagsBelongToPost:Association<Posts_Tags, Posts>;
       tagHasManyPosts_Tags:Association<Tags, Posts_Tags>;
       post_TagsBelongToTag:Association<Posts_Tags, Tags>;
     };
     
  };

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
      }
    }, {
      sequelize,
      modelName: 'posts_tags',
      tableName: 'posts_tags',
      freezeTableName: true,
      timestamps: true,
    createdAt: 'createAt',
    updatedAt: 'updatedAt'
    });
    
  Posts.hasMany(Posts_Tags, {
    sourceKey: 'id',
    foreignKey: 'postId',
    onDelete: 'CASCADE',
    as: 'postHasManyPosts_Tags'
  });
  Posts_Tags.belongsTo(Posts,{
    targetKey:'id',
    foreignKey: 'postId',
    onDelete: 'CASCADE',
    as: 'posts_TagsBelongToPost'
  });

  Tags.hasMany(Posts_Tags, {
    sourceKey: 'id',
    foreignKey: 'tagId',
    onDelete: 'CASCADE',
    as: 'tagHasManyPosts_Tags'
  });
  Posts_Tags.belongsTo(Tags,{
    targetKey:'id',
    foreignKey: 'tagId',
    onDelete: 'CASCADE',
    as: 'post_TagsBelongToTag'
  });


