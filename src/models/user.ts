
import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from './index';

interface UsersAttributes {
  email: string,
  password: string,
  nickname: string,
  socialType: string,
  manager: boolean,
  area: string,
  area2: string
}

export class User extends Model<UsersAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  public readonly id! : number;
  public email! : string;
  public password! : string;
  public nickname! : string;
  public socialType! : string;
  public manager! : boolean;
  public area! : string;
  public area2! : string;

  public readonly createdAt!: Date;  
  public readonly updatedAt!: Date;

    static associate(models:any) {
      models.user.hasMany(models.post, {
        foreignKey: 'userId',
        sourceKey: 'id',
        onDelete: 'CASCADE'
      });
      models.user.hasMany(models.comment, {
        foreignKey: 'userId',
        sourceKey: 'id',
        onDelete: 'CASCADE'
      });
      models.user.hasMany(models.likes, {
        foreignKey: 'userId',
        sourceKey: 'id',
        onDelete: 'CASCADE'
      });
      models.user.hasMany(models.recentsearch, {
        foreignKey: 'userId',
        sourceKey: 'id',
        onDelete: 'CASCADE'
      });
    }
  };
  
  User.init({
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
    }
  }, {
    sequelize,
    modelName: 'user',
    tableName: 'user',
    freezeTableName: true,
    timestamps: true,
    createdAt: "createAt",
    updatedAt: "updateAt"
  });
  
// Before
// module.exports = (sequelize:any, DataTypes:any) => {
//   class user extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models:any) {
//       models.user.hasMany(models.post, {
//         foreignKey: 'userId',
//         sourceKey: 'id',
//         onDelete: 'CASCADE'
//       });
//       models.user.hasMany(models.comment, {
//         foreignKey: 'userId',
//         sourceKey: 'id',
//         onDelete: 'CASCADE'
//       });
//       models.user.hasMany(models.likes, {
//         foreignKey: 'userId',
//         sourceKey: 'id',
//         onDelete: 'CASCADE'
//       });
//       models.user.hasMany(models.recentsearch, {
//         foreignKey: 'userId',
//         sourceKey: 'id',
//         onDelete: 'CASCADE'
//       });
//     }
//   };
//   user.init({
//     email: DataTypes.STRING,
//     password: DataTypes.STRING,
//     nickname: DataTypes.STRING,
//     socialType: DataTypes.STRING,
//     manager: DataTypes.BOOLEAN,
//     area: DataTypes.STRING,
//     area2: DataTypes.STRING
//   }, {
//     sequelize,
//     modelName: 'user',
//     freezeTableName: true,
//     timestamps: true,
//     createdAt: "createAt",
//     updatedAt: "updateAt"
//   });
//   return user;
// };

// export = {}