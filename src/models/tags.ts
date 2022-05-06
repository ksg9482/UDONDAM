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
  import { sequelize } from './index';
import { Posts } from './posts';

  export interface tagsAttributes {
    id: number,
    content: string,
    createdAt: Date,
    updatedAt: Date
  }

export type tagsPk = "id";
export type tagsId = Tags[tagsPk];
export type tagsOptionalAttribues = 
"id" 
| "content"
| "createdAt"
| "updatedAt"; 
export type tagsCreationAttributes = Optional<tagsAttributes,tagsOptionalAttribues>


  export class Tags extends Model<tagsAttributes, tagsCreationAttributes> implements tagsAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     public readonly id!: number;
     public content!: string;
 
     public readonly createdAt!: Date;
     public readonly updatedAt!: Date;

     public static associations: {
      tagsbelongsToManyPosts: Association<Tags, Posts>,
    }

    static initModel(sequelize: Sequelize): typeof Tags {
      Tags.init({
        id: {
          autoIncrement:true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true
        },
        content:{
          type: DataTypes.STRING,
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
        modelName: 'tag',
        freezeTableName: true,
        timestamps: false,
      });
      return Tags;
    };
  };
Tags.belongsToMany(Posts, {
  through: 'post_tag',
  sourceKey: 'id',
  foreignKey: 'tagId',
  onDelete: 'CASCADE',
  as: 'tagsbelongsToManyPosts'
});
