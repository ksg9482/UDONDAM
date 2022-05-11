import { Posts } from "../../models/posts.model"; 

console.log("======Create Posts Table======");

const create_table_posts = async () => {
  await Posts.sync({force:true})
  .then(()=>{console.log('posts success')})
  .catch((err)=>{console.log('posts error:', err)})
};
create_table_posts();
// module.exports = {
//   up: async (queryInterface:any, Sequelize:any) => {
//     await queryInterface.createTable('posts', {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER
//       },
//       content: {
//         allowNull: false,
//         type: Sequelize.STRING
//       },
//       public: {
//         allowNull: false,
//         type: Sequelize.BOOLEAN
//       },
//       createAt: {
//         allowNull: false,
//         type: Sequelize.DATE
//       }
//     })
//     .then(() => {
//       queryInterface.addColumn('post', 'userId', {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         onDelete: 'CASCADE',
//         references: {model: 'user', key:'id'}
//       })
//     })
//     .then(() => {
//       queryInterface.addColumn('post_tag', 'postId', {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         onDelete: 'CASCADE',
//         references: {model: 'post', key:'id'}
//       })
//     })
//   },
//   down: async (queryInterface:any, Sequelize:any) => {
//     let sql ='SET FOREIGN_KEY_CHECKS = 0';
//     await queryInterface.sequelize.query(sql, {
//         type: Sequelize.QueryTypes.RAW,
//     })
//     await queryInterface.dropTable('post');
//   }
// };