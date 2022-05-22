import {
  DataTypes,
  Model
} from 'sequelize';
import sequelize from './index';

export interface ItagsAttributes {
  id?: number,
  content?: string,
};

export class Tags extends Model<ItagsAttributes> {

  public static readonly id?: number;
  public static content?: string;

  public static associations: {};
};


Tags.init({
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'tags',
  tableName: 'tags',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updatedAt'
});


