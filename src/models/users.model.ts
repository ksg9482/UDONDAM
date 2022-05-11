
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
import { Comments } from './comments.model';
import  sequelize  from './index';
import { Likes } from './likes.model';
import { Posts } from './posts.model'
import { RecentSearchs } from './recentsearchs.model';

export interface IusersAttributes {
  id?: number,
  email: string,
  password: string,
  nickname?: string,
  socialType?: string,
  manager?: boolean,
  area?: string,
  area2?: string,
  //createdAt?: Date,
  //updatedAt?: Date
}

// export type usersPk = "id";
// export type usersId = Users[usersPk];
// export type usersOptionalAttribues = 
// "id" 
// | "email" 
// | "password"
// | "nickname"
// | "socialType"
// | "manager"
// | "area"
// | "area2"
// | "createdAt"
// | "updatedAt"; 
// export type usersCreationAttributes = Optional<IusersAttributes,usersOptionalAttribues>

//type UsersCreateInterface = Pick<IusersAttributes,'type'>

//enum으로 소셜타입 추가.
export enum UserSocialType {
  basic = 'basic',
  google = 'google',
  naver = 'naver'
};

export class Users extends Model<IusersAttributes/* ,usersCreationAttributes*/> {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  public readonly id?: number;
  public email?: string;
  public password?: string;
  public nickname?: string;
  public socialType?: string;
  public manager?: boolean;
  public area?: string;
  public area2?: string;

  //public readonly createdAt?: Date;
  //public readonly updatedAt?: Date;
  
  public static associations: { };

  
};

//static initModel(sequelize: Sequelize): typeof Users {
  Users.init({
    id: {
      autoIncrement:true,
      type: DataTypes.INTEGER,
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
      allowNull: false,
      defaultValue:'익명'
    },
    socialType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: UserSocialType.basic
    },
    manager: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:false
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue:'인증해주세요'
    },
    area2: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue:'인증해주세요'
    },
    // createdAt:{
    //   type: DataTypes.DATE,
    //   allowNull: false,
    //   defaultValue: Date.now()
    // },
    // updatedAt:{
    //   type: DataTypes.DATE,
    //   allowNull: false,
    //   defaultValue: Date.now()
    //}
  }, {
    sequelize,
    modelName: 'users',
    tableName: 'users',
    freezeTableName: true,
    timestamps: true,
    //createdAt: true,
    updatedAt: 'updatedAt'
  });
//   return Users;
// }


