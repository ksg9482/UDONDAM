
import {
  DataTypes,
  Model
} from 'sequelize';
import * as bcrypt from "bcrypt"
import sequelize from './index';

export interface IusersAttributes {
  id?: number,
  email: string,
  password: string,
  nickname?: string,
  socialType?: string,
  manager?: boolean,
  area?: string,
  area2?: string,
};

export enum UserSocialType {
  basic = 'basic',
  google = 'google',
  naver = 'naver'
};

export class Users extends Model<IusersAttributes> {

  public static readonly id?: number;
  public static email?: string;
  public static password?: string;
  public static nickname?: string;
  public static socialType?: string;
  public static manager?: boolean;
  public static area?: string;
  public static area2?: string;

  public static associations: {};

  static hashPassword = async (password: any) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  static validPassword = async (password: any, hashedPassword: any) => {
    return await bcrypt.compare(password, hashedPassword);
  };
};
Users.init({
  id: {
    autoIncrement: true,
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
    allowNull: false,
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '익명'
  },
  socialType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: UserSocialType.basic
  },
  manager: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '인증해주세요'
  },
  area2: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '인증해주세요'
  }
}, {
  sequelize,
  modelName: 'users',
  tableName: 'users',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updatedAt',

  hooks: {
    beforeCreate: async (user: any) => {
      if (user.password) {
        user.password = await Users.hashPassword(user.password);
      }
    },
    beforeUpdate: async (user: any) => {
      if (user.password) {
        user.password = await Users.hashPassword(user.password);
      }
    }
  }
});


