
module.exports = {
  up: async (queryInterface:any, Sequelize:any) => {
    await queryInterface.createTable('tag', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        allowNull: false,
        type: Sequelize.STRING
      }
    })
    .then(() => {
      queryInterface.addColumn('post_tag', 'tagId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {model: 'tag', key:'id'}
      })
    });
  },
  down: async (queryInterface:any, Sequelize:any) => {
    let sql ='SET FOREIGN_KEY_CHECKS = 0';
    await queryInterface.sequelize.query(sql, {
        type: Sequelize.QueryTypes.RAW,
    })
    await queryInterface.dropTable('tag');
  }
};