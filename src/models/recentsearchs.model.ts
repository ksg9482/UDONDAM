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
import  sequelize  from './index';
import { Users } from './users.model';

export interface IrecentSearchsAttributes {
  id?: number,
  userId?: number,
  tag?: string,
  notTag?: string,
 //createdAt: Date,
 //updatedAt: Date
}

// export type recentSearchsPk = "id";
// export type recentSearchsId = RecentSearchs[recentSearchsPk];
// export type recentSearchsOptionalAttribues =
//   "id"
//   | "userId"
//   | "tag"
//   | "notTag"
//   | "createdAt"
//   | "updatedAt";
// export type recentSearchsCreationAttributes = Optional<IrecentSearchsAttributes, recentSearchsOptionalAttribues>


export class RecentSearchs extends Model<IrecentSearchsAttributes>{
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */

  public static readonly id?: number;
  public static userId?: number;
  public static tag?: string;
  public static notTag?: string;

  //public readonly createdAt?: Date;
  //public readonly updatedAt?: Date;
  
  public static associations: {
    userHasManyRecentsearchs:Association<Users, RecentSearchs>
    resentSearchsBelongsToUser: Association<RecentSearchs, Users>,
  }

  
};

//static initModel(sequelize: Sequelize): typeof RecentSearchs {
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
    },
    // createdAt: {
    //   type: DataTypes.DATE,
    //   allowNull: false
    // },
    // updatedAt: {
    //   type: DataTypes.DATE,
    //   allowNull: false
    // }
  }, {
    sequelize,
    modelName: 'recentsearchs',
    tableName:'recentsearchs',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createAt',
    updatedAt: 'updatedAt'
  });
//   return RecentSearchs;
// };

Users.hasMany(RecentSearchs, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyRecentsearchs'
});
RecentSearchs.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  //sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'resentSearchsBelongsToUser',
});