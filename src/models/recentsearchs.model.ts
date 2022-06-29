import {
  DataTypes,
  Model,
  Association
} from 'sequelize';
import sequelize from './index';
import { Users } from './users.model';

export interface IrecentSearchsAttributes {
  id?: number,
  userId?: number,
  tag?: string,
  notTag?: string
}

export class RecentSearchs extends Model<IrecentSearchsAttributes>{

  readonly id?: number;
  userId?: number;
  tag?: string;
  notTag?: string;

  public static associations: {
    userHasManyRecentsearchs: Association<Users, RecentSearchs>
    resentSearchsBelongsToUser: Association<RecentSearchs, Users>,
  };

  static recentStrToArr = (recentStr: any) => {

    const recentInput = [...recentStr];

    const recentOutput = recentInput.map((recentUnit: any) => {
        const tagArr = recentUnit.tag.split(',');
        const notTagArr = recentUnit.notTag ? recentUnit.notTag.split(',') : null;

        recentUnit.tag = tagArr;
        recentUnit.notTag = notTagArr;

        return recentUnit;
    })

    return recentOutput
};
};
RecentSearchs.init({
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tag: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notTag: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'recentsearchs',
  tableName: 'recentsearchs',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updatedAt'
})

Users.hasMany(RecentSearchs, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyRecentsearchs'
});
RecentSearchs.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'resentSearchsBelongsToUser',
});