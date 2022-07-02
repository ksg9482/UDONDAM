
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

export interface IUserData {
  userId: number,
  nickname: string,
  area: string,
  area2: string,
  manager: boolean,
  socialType: UserSocialType
}

export enum UserSocialType {
  basic = 'basic',
  google = 'google',
  naver = 'naver'
};

export class Users extends Model<IusersAttributes> {

  readonly id?: number;
  email?: string;
  password?: string;
  nickname?: string;
  socialType?: UserSocialType;
  manager?: boolean;
  area?: string;
  area2?: string;

  static associations: {};

  static hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  static validPassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
  };

  //왜 이메일, 아이디 두개로 나눴는가? 로그인 유무. 로그인 안한 상태에선 id가 없기에 이메일로 식별
  static findByEmail = async (email: string) => {
    return await this.findOne({
      where: {
        email: email
      },
      raw:true
    })
  };

  //userId로 간단하게 찾는 용도.
  static findById = async (userId: number, attributes?:Array<any>) => {
    const query = attributes
    ? {
      where: {
        id: userId
      },
      raw:true,
      attributes:attributes
    } 
    : {
      where: {
        id: userId
      },
      raw:true
    }
    const result = await this.findOne(query);
    //manager가 boolean인데 mysql은 0, 1로 저장함
    //@ts-ignore
    result?.manager === 0 ? result?.manager = false : result?.manager = true
    return result
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
    beforeCreate: async (user: Users): Promise<void> => {
      if (user.password) {
        user.password = await Users.hashPassword(user.password);
      }
    },
    beforeUpdate: async (user: Users): Promise<void> => {
      if (user.password) {
        user.password = await Users.hashPassword(user.password);
      }
    }
  }
});


