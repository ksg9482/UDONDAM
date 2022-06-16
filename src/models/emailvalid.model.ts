import {
    DataTypes,
    Model,
    Association
} from 'sequelize';
import sequelize from './index';
import { Posts } from './posts.model';
import { Users } from './users.model';

export interface IEmailValidAttributes {
    id: number;
    userId: number;
    code: string;
};

export class EmailValid extends Model<IEmailValidAttributes>{
    readonly id?: number;
    userId?: number;
    code?: string;

    public static associations: {
        userBelongsToEmailValid: Association<Users, EmailValid>
    };


};

EmailValid.init({
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
    code: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'emailvalid',
    tableName: 'emailvalid',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createAt',
    updatedAt: 'updatedAt'
});

Users.belongsTo(EmailValid, {
    foreignKey: 'userId',
    targetKey:'id',
    onDelete: 'CASCADE',
    as: 'userBelongsToEmailValid'
  });