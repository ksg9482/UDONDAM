import {
  DataTypes,
  Model,
  Association,
  Op
} from 'sequelize';
import { Comments } from './comments.model';
import sequelize from './index';
import { Likes } from './likes.model';
import { Posts_Tags } from './posts_tags.model';
import { Tags } from './tags.model';
import { Users } from './users.model';

export interface IpostsAttributes {
  id?: number,
  content: string,
  userId: number,
  public?: boolean
};

export interface IlikeArr {
  postId: number;
  likeCount: number;
};

export interface IuserLikeArr {
  postId: number;
};

export class Posts extends Model<IpostsAttributes> {

  readonly id?: number;
  content?: string;
  userId?: number;
  public?: boolean;

  public static associations: {
    userHasManyPosts: Association<Users, Posts>,
    postsbelongsToUser: Association<Posts, Users>
  };

  static postFormKeyNameChange = (postForm:any) => {
    interface IpostFormKeyNameChangeOutput {
      postId: number;
      postContent:string;
      public: 1 | 0;
      createAt: Date;
      userId:number;
      nickname: string;
      content:string;
    }
    console.log(postForm)
    const nameChangedObj:IpostFormKeyNameChangeOutput = {
      postId: postForm.postId,
      postContent: postForm['posts_TagsBelongToPost.postContent'],
      public: postForm['posts_TagsBelongToPost.public'],
      createAt: postForm['posts_TagsBelongToPost.createAt'],
      userId: postForm['posts_TagsBelongToPost.postsbelongsToUser.id'],
      nickname: postForm['posts_TagsBelongToPost.postsbelongsToUser.nickname'],
      content: postForm['post_TagsBelongToTag.post_TagsBelongToTag.content']
    };

    return nameChangedObj
  }
  //likeArr: 포스트에 like가 몇개인지
  //userLikeArr: 포스트 arr에 중에 사용자가 like한 포스트 아이디가 무엇인지
  static setPostForm = (postAndTagArr: any[], commentArr: any[], likeArr: IlikeArr[], userLikeArr: IuserLikeArr[]) => {
    //commentArr 형식수정 필요. [{postId:2, commentList:[...]}]
    //[ { postId: 2, likeCount: 3 } ] [ { postId: 2 } ]

    
    //코멘트와 라이크가 없을 경우(빈배열, 빈객체) 처리 - count 0, 빈배열 넣어줘야 함.
    //postId_2 형식 안쓸거니 이거 수정해줘야 함
    const result = postAndTagArr.map((post: any) => {
        const publicCheck = post['posts_TagsBelongToPost.public'] === 1 ? true : false;
        const tagArr = post['post_TagsBelongToTag.post_TagsBelongToTag.content'].split(',');
        const commentCount = Comments.getCommentCount(post.postId, commentArr);
        
        //객체임. 배열아님.
        const findLikeCount = likeArr.find((likeUnit:any) => {return likeUnit.postId === post.postId});
        const likeCount = findLikeCount ? findLikeCount.likeCount : 0 //find는 결과값을 내거나 undefined
        const likeCheck = userLikeArr.length !== 0 ? userLikeArr.includes(post.postId): false;//postId.includes(post.postId): false;
        
        const nameChangedObj = this.postFormKeyNameChange(post);

        const postForm = {
            id: post.postId,
            userId: nameChangedObj.userId,
            nickname: nameChangedObj.nickname,
            content: nameChangedObj.postContent,
            tag: tagArr,
            commentCount: commentCount,
            likeCount: likeCount,
            likeCheck: likeCheck,
            createAt: nameChangedObj.createAt,
            public: publicCheck
        };
        return postForm;
    });
    
    return result;
};

};

Posts.init({
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  public: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'posts',
  tableName: 'posts',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updatedAt'
});

Users.hasMany(Posts, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyPosts'
});
Posts.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'postsbelongsToUser',
});


