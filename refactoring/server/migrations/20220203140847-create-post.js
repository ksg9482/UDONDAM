'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        allowNull: false,
        type: Sequelize.STRING
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      public: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
    /*.then(() => {
      queryInterface.addColumn('post', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {model: 'user', key:'id'}
      })
    })
    .then(() => {
      queryInterface.addColumn('post_tag', 'postId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {model: 'post', key:'id'}
      })
    }) */
    ;//왜 then으로 연결했는가? 외부키 설정하면 생기는 건가?
  },
  async down(queryInterface, Sequelize) {
    /* let sql ='SET FOREIGN_KEY_CHECKS = 0';
    await queryInterface.sequelize.query(sql, {
        type: Sequelize.QueryTypes.RAW,
    })
    await queryInterface.dropTable('post');  */
    await queryInterface.dropTable('posts');
  }
};