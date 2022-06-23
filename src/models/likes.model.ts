import {
  DataTypes,
  Model,
  Association,
  Op
} from 'sequelize';
import sequelize from './index';
import { Posts } from './posts.model';
import { Users } from './users.model';

export interface IlikesAttributes {
  id?: number,
  userId: number,
  postId: number
};

export class Likes extends Model<IlikesAttributes> {

  readonly id?: number;
  userId?: number;
  postId?: number;

  public static associations: {
    userHasManyLikes: Association<Users, Likes>
    likesBelongsToUser: Association<Likes, Users>,

    postHasManyLikes: Association<Posts, Likes>
    likesBelongsToPost: Association<Likes, Posts>,
  };

  static overlapCheck = async (userId: number, postId: number) => {
    const result = await this.findOne({
      where: {
        userId: userId,
        postId: postId
      }
    });

    return result ? true : false;
  };

  static isLiked = async (userId: number) => {
    const result = await this.findOne({
      attributes: ['userId'],
      where: { userId: userId },
      raw:true
    });
console.log(result)
    return result ? true : false
  };

  static matchedLike = async (targetPostId: number[]) => {
    const result = await Likes.findAll({
      where: { postId: { [Op.in]: targetPostId } },
      attributes: {
        include: [
          //tag에 맞춰서 검출되는 게 늘어남. userId가 3개 나오니 count도 3됨
          [sequelize.fn("COUNT", sequelize.col('userId')), "likeCount"],
        ],
        exclude: ['id', 'createAt', 'updatedAt', 'userId']
      },
      raw: true,
      group: ['postId'],
      logging: true
    })
    return result;
  };
};

Likes.init({
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
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'likes',
  modelName: 'likes',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updatedAt'
});

Users.hasMany(Likes, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyLikes'
});
Likes.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'likesBelongsToUser',
});



Posts.hasMany(Likes, {
  foreignKey: 'postId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'postHasManyLikes'
});
Likes.belongsTo(Posts, {
  foreignKey: 'postId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'likesBelongsToPost',
});
