
const {
  Model
} = require('sequelize');
module.exports = (sequelize:any, DataTypes:any) => {
  class tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models:any) {
      // define association here
      models.tag.belongsToMany(models.post, {
        through: 'post_tag',
        sourceKey: 'id',
        foreignKey: 'tagId',
        onDelete: 'CASCADE'
      });
    }
  };
  tag.init({
    content: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tag',
    freezeTableName: true,
    timestamps: false,

  });
  return tag;
};

export = {}