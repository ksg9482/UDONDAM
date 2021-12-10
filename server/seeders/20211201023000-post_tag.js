'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('post_tag', [
      {
        id: 1,
        postId: 1,
        tagId: 2
      },
      {
        id: 2,
        postId: 1,
        tagId: 162
      },
      {
        id: 3,
        postId: 2,
        tagId: 2
      },
      {
        id: 4,
        postId: 2,
        tagId: 163
      },
      {
        id: 5,
        postId: 3,
        tagId: 15
      },
      {
        id: 6,
        postId: 3,
        tagId: 165
      },
      {
        id: 7,
        postId: 4,
        tagId: 1
      },
      {
        id: 8,
        postId: 4,
        tagId: 162
      },
      {
        id: 9,
        postId: 5,
        tagId: 3
      },
      {
        id: 10,
        postId: 5,
        tagId: 167
      },
      ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('post_tag', null, {});
  }
};
