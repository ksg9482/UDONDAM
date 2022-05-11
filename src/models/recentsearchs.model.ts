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
  id: number,
  userId: number,
  tag: string,
  notTag: string,
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

  public readonly id?: number;
  public userId?: number;
  public tag?: string;
  public notTag?: string;

  //public readonly createdAt?: Date;
  //public readonly updatedAt?: Date;
  
  public static associations: {
    userHasManyRecentsearch:Association<Users, RecentSearchs>
    resentSearchBelongsToUsers: Association<RecentSearchs, Users>,
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
      allowNull: false
    },
    notTag: {
      type: DataTypes.STRING,
      allowNull: false
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
    modelName: 'recentsearch',
    freezeTableName: true,
    timestamps: true,
    //createdAt: true,
    updatedAt: 'updatedAt'
  });
//   return RecentSearchs;
// };

Users.hasMany(RecentSearchs, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyRecentsearch'
});
RecentSearchs.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  //sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'resentSearchBelongsToUsers',
});