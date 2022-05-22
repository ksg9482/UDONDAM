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

  public static readonly id?: number;
  public static userId?: number;
  public static tag?: string;
  public static notTag?: string;

  public static associations: {
    userHasManyRecentsearchs: Association<Users, RecentSearchs>
    resentSearchsBelongsToUser: Association<RecentSearchs, Users>,
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