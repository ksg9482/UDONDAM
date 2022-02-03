'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    nickname: DataTypes.STRING,
    socialType: DataTypes.STRING,
    manager: DataTypes.BOOLEAN,
    area: DataTypes.STRING,
    area2: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
    freezeTableName: true, //데이터베이스를 자동으로 복수형으로 생성하나 이 옵션으로 테이블 이름을 모델 그대로 쓸 수 있음
    timestamps: true,
    createdAt: "createAt", //이름변경
    updatedAt: "updateAt" //이름변경
  });
  return user;
};