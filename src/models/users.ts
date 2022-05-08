
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
import { Comments } from './comments';
 import { sequelize } from './index';
import { Likes } from './likes';
import { Posts } from './posts'
import { RecentSearchs } from './recentsearchs';

export interface IusersAttributes {
  id: number,
  email: string,
  password: string,
  nickname: string,
  socialType: string,
  manager: boolean,
  area: string,
  area2: string,
  createdAt: Date,
  updatedAt: Date
}

export type usersPk = "id";
export type usersId = Users[usersPk];
export type usersOptionalAttribues = 
"id" 
| "email" 
| "password"
| "nickname"
| "socialType"
| "manager"
| "area"
| "area2"
| "createdAt"
| "updatedAt"; 
export type usersCreationAttributes = Optional<IusersAttributes,usersOptionalAttribues>

//type UsersCreateInterface = Pick<IusersAttributes,'type'>

export class Users extends Model<IusersAttributes, usersCreationAttributes> implements IusersAttributes {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  public readonly id!: number;
  public email!: string;
  public password!: string;
  public nickname!: string;
  public socialType!: string;
  public manager!: boolean;
  public area!: string;
  public area2!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    userHasManyPost: Association<Users, Posts>,
    userHasManyComment:Association<Users, Comments>
    userHasManyLike:Association<Users, Likes>
    userHasManyRecentsearch:Association<Users, RecentSearchs>
  }

  static initModel(sequelize: Sequelize): typeof Users {
    Users.init({
      id: {
        autoIncrement:true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      socialType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      manager: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      area: {
        type: DataTypes.STRING,
        allowNull: false
      },
      area2: {
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
      modelName: 'users',
      tableName: 'users',
      freezeTableName: true,
      timestamps: false,
      //createdAt: "createAt",
      //updatedAt: "updateAt"
    });
    return Users;
  }
};


Users.hasMany(Posts, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyPost'
});
Users.hasMany(Comments, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyComment'
});
Users.hasMany(Likes, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyLike'
});
Users.hasMany(RecentSearchs, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyRecentsearch'
});
