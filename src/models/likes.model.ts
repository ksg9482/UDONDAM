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
  id?: number;
  userId: number;
  postId: number;
};

interface IlikeFormChange {
  postId: number;
  likeCount: number;
}

interface resultArrOutput {
  postId:number;
  likeCount:number;
}


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

  // static mergeLikePostIdArr = (likeArr:any) => {
  //   console.log(likeArr)
  //   if (likeArr.length === 0) {
  //     return {};
  //   };
 
  //   if (likeArr.length === 1) {
  //     const key = Object.keys(likeArr[0])[0];
  //     const postIdArr = { postId: [likeArr[0][key]]};
      
  //     return postIdArr;
  //   }
  //   const result = likeArr.reduce((acc: any, cur: any) => {
      
  //     const accKey = Object.keys(acc)[0];
  //     const curKey = Object.keys(cur)[0];
      
  //     if(accKey === curKey) {
  //       if(!Array.isArray(acc[accKey])) {
  //         acc[accKey] = [acc[accKey]];
  //       };
  //       acc[accKey].push(cur[curKey]);

  //       return acc
  //     }

  //     acc[curKey] = cur[curKey];
      
  //     return acc;
  //   })
    
  //   return result
  // }

  static overlapCheck = async (userId: number, postId: number) => {
    const result = await this.findOne({
      where: {
        userId: userId,
        postId: postId
      }
    });

    return result ? true : false;
  };
  
  static isLiked = async (userId: number, targetPostIdArr: number[]) => {
    const result = await this.findAll({
      attributes: ['postId'],
      where: { 
        userId: userId,
        postId: {[Op.in]: targetPostIdArr }
      },
      raw:true
    });
    
    return result;
  };


  static matchedLike = async (targetPostIdArr: number[]) => {
    
    const resultArr = await Likes.findAll({
      where: { postId: { [Op.in]: targetPostIdArr } },
      attributes: {
        include: [
          //왜 like를 분리했나? tag에 맞춰서 검출되는 게 늘어남. 태그당 postId가 1개 나오니 count도 늘어남
          [sequelize.fn("COUNT", sequelize.col('userId')), "likeCount"],
        ],
        exclude: ['id', 'createAt', 'updatedAt', 'userId']
      },
      raw: true,
      group: ['postId']
    });
    
    return resultArr;
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
