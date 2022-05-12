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

  export interface ItagsAttributes {
    id?: number,
    content?: string,
    //createdAt: Date,
    //updatedAt: Date
  }

// export type tagsPk = "id";
// export type tagsId = Tags[tagsPk];
// export type tagsOptionalAttribues = 
// "id" 
// | "content"
// | "createdAt"
// | "updatedAt"; 
// export type tagsCreationAttributes = Optional<ItagsAttributes,tagsOptionalAttribues>


  export class Tags extends Model<ItagsAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     public static readonly id?: number;
     public static content?: string;
 
     //public readonly createdAt?: Date;
     //public readonly updatedAt?: Date;
     
     public static associations: {
      
    };

    
  };

  //static initModel(sequelize: Sequelize): typeof Tags {
    Tags.init({
      id: {
        autoIncrement:true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      content:{
        type: DataTypes.STRING,
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
      modelName: 'tags',
      tableName: 'tags',
      freezeTableName: true,
      timestamps: true,
    createdAt: 'createAt',
    updatedAt: 'updatedAt'
    });
  //   return Tags;
  // };

  
