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
  //만약 1만개 이상의 포스트가 불러와지고 그중에 like되어있는거를 어떻게?
  //내 userId는 고정. for문 등으로 하나하나 검사하면 db연결 때문에 병목.
  //가져올 때 db에서 판단해주면? 지금 내 실력으론 감도 안잡힘
  //가져온 후 서버에서 검사? 
  //DB에 물어보는 것도 어차피 10개 단위. IN으로 넣어서 그 10개중 like.userId겹치는 걸로
  //서버에서 맞추는 건 오히려 비효율. 만약 100만 like였으면 그걸 10번 반복해야함.
  //postId 10개 단위 -> 10개에 맞춰 like, comment. 10개 중 내가 like한거, [{postId2:[{commentId1:{content:"s",re:[]}}]}]식으로 comment폼
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
