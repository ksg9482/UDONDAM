'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      nickname: {
        allowNull: false,
        defaultValue: "익명",
        type: Sequelize.STRING
      },
      socialType: {
        allowNull: false,
        defaultValue: "basic",
        type: Sequelize.STRING
      },
      manager: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      area: {
        allowNull: false,
        type: Sequelize.STRING
      },
      area2: {
        allowNull: false,
        defaultValue: "인증해주세요",
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        defaultValue: "인증해주세요",
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    /* let sql ='SET FOREIGN_KEY_CHECKS = 0';
    await queryInterface.sequelize.query(sql, {
        type: Sequelize.QueryTypes.RAW,
      })
    await queryInterface.dropTable('user'); */
    await queryInterface.dropTable('users');//테이블명 주의 
  }
};