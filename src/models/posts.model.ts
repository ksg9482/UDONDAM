import {
  DataTypes,
  Model,
  Association
} from 'sequelize';
import sequelize from './index';
import { Users } from './users.model';

export interface IpostsAttributes {
  id?: number,
  content: string,
  userId: number,
  public?: boolean
};

export class Posts extends Model<IpostsAttributes> {

  readonly id?: number;
  content?: string;
  userId?: number;
  public?: boolean;

  public static associations: {
    userHasManyPosts: Association<Users, Posts>,
    postsbelongsToUser: Association<Posts, Users>
  };
};

Posts.init({
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  public: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'posts',
  tableName: 'posts',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updatedAt'
});

Users.hasMany(Posts, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyPosts'
});
Posts.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'postsbelongsToUser',
});


