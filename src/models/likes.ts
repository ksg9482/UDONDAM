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
import { Users } from './users';

  export interface IlikesAttributes {
    id: number,
    userId: number,
    postId: number,
    createdAt: Date,
    updatedAt: Date
  }

export type likesPk = "id";
export type likesId = Likes[likesPk];
export type likesOptionalAttribues = 
"id" 
| "userId" 
| "postId"
| "createdAt"
| "updatedAt"; 
export type likesCreationAttributes = Optional<IlikesAttributes,likesOptionalAttribues>


export class Likes extends Model<IlikesAttributes, likesCreationAttributes> implements IlikesAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    public readonly id!: number;
    public userId!: number;
    public postId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
      likesBelongsToUsers: Association<Likes, Users>,
      likesBelongsToPosts: Association<Likes, Posts>,
    };

    static initModel(sequelize: Sequelize): typeof Likes {
      Likes.init({
        id: {
          autoIncrement:true,
          type: DataTypes.BIGINT,
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
        tableName: 'likes',
        modelName: 'likes',
        freezeTableName: true,
        timestamps: true,
        //createdAt: 'createAt',
        //updatedAt: false
      });
      return Likes; 
    };
  };
  Likes.belongsTo(Users, {
    foreignKey: 'userId',
    targetKey: 'id',
    //sourceKey: 'id',
    onDelete: 'CASCADE',
    as: 'likesBelongsToUsers',
  });
  Likes.belongsTo(Posts, {
    foreignKey: 'postId',
    targetKey: 'id',
    //sourceKey: 'id',
    onDelete: 'CASCADE',
    as: 'likesBelongsToPosts',
  });
  