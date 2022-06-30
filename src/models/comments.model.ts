import {
  DataTypes,
  Model,
  Association,
  Op
} from 'sequelize';
import sequelize from './index';
import { Likes } from './likes.model';
import { Posts } from './posts.model';
import { Users } from './users.model';

export interface IcommentsAttributes {
  id?: number,
  content: string,
  userId: number,
  postId: number,
  commentId?: number | null
};



export class Comments extends Model<IcommentsAttributes>{


  readonly id?: number;
  content?: string;
  userId?: number;
  postId?: number;
  commentId?: number | null;
  comment?: Comments[];

  public static associations: {
    userHasManyComments: Association<Users, Comments>
    commentsBelongsToUser: Association<Comments, Users>,

    posthasManyComments: Association<Posts, Comments>
    commentsBelongsToPost: Association<Comments, Posts>,
  };

  static getMatchedComment = async (targetPostId: number[]) => {
    const result = await this.findAll({
      raw: true,
      attributes: ["id", "content", "userId", "postId", "commentId", "createAt"],
      where: { postId: { [Op.in]: targetPostId } },
      include: [
        {
          model: Users,
          as: 'commentsBelongsToUser',
          attributes: ['nickname']
        }
      ],
      order: [['postId', 'DESC']]
    });

    return result;
  };

  static setRecomment = (commentList: Comments[]) => {
    const resultArr:Comments[] = [];
    
    for (let comment of commentList) {
      if(comment.commentId === null) {
        resultArr.push(comment)
        continue ;
      };
      const targetCommentId = comment.commentId!;
      //대댓글이 들어가야 할 코멘트는 이미 들어가 있음(commentId === null, order 처리)
      const targetComment = resultArr.find((comment: any) => {
        return comment.id === targetCommentId;
      })!;

      if(!targetComment.comment) {
        targetComment.comment = [];
      }
      
      targetComment.comment.push(comment);
    };
    return resultArr;
  }
  

  static setCommentForm = (commentArr: Comments[]) => {
    
    interface IcommentByPostId {
      postId: number;
      commentList: Comments[]
    };

    if (commentArr.length === 0) {
      return [];
    }

    const commentByPostId: IcommentByPostId[] = [];
    const recommentSorted = this.setRecomment(commentArr)
    
    for (let comment of recommentSorted) {
      //commentId 있으면 거기에 넣어줘야 함
      
      
      const arrCheck = commentByPostId.find((commentUnit: any) => {
        return commentUnit.postId === comment.postId;
      });

      if (arrCheck) {
        arrCheck.commentList.push(comment);
        continue;
      }

      if(comment.postId) {
        commentByPostId.push({ postId: comment.postId, commentList: [comment] })
      }
      
    }

    return commentByPostId;
  };

  static getCommentCount = (targetPostId: number, sortedComment: any[]):number => {
    const targetArr = sortedComment.find((commentUnit:any) => {
      return commentUnit.postId === targetPostId;
    })
    if (!targetArr) {
      return 0;
    }
    return targetArr.commentList.length;
  };

  static setComment = (commentArr:any[], postArr:any[]) => {
    interface IsetCommentOutput {
      id: number,
      userId: number,
      nickname: string,
      content: string,
      tag: string[],
      commentCount: number,
      likeCount: number,
      likeCheck: boolean,
      createAt: Date,
      public: boolean,
      comment: any[]
    };

    const resultPostArr:IsetCommentOutput[] = [];

    for (let post of postArr) {
        const postId = post.id;
        
        if(commentArr.length === 0) {
            post['comment'] = [];
            resultPostArr.push(post)
            continue;
        }
        
        const targetComment = commentArr.find((comment:any)=> {
            return comment.postId === postId;
        }).commentList;
        
        post['comment'] = targetComment ;
        resultPostArr.push(post);
    };
    
    return resultPostArr;
};

static insertComment = (commentArr: any[], postArr: any[]) => {
  
  const result = this.setComment(commentArr, postArr);
  
  return result;
};

static getPostIdArr = (postArr: any[]):number[] => {
  const resultArr:number[] = [];
  for (let post of postArr) {
      resultArr.push(post.id);
  };

  return resultArr
};

static setCommentPostForm = (postArr:Posts[], likeCountArr:Likes[]) => {

  interface IresultForm {
      id: number;
      content: string;
      createAt: string;
      commentCount: number;
      likeCount:number | undefined;
  }
  
  interface IfindLikeCount extends Likes {
    likeCount?: number;
  }
  
  const result = postArr.map((targetPost:any) => {
      const form:IresultForm = {
          id: targetPost.id,
          content: targetPost.content,
          createAt:targetPost.createAt,
          commentCount: targetPost['posthasManyComments.commentCount'],
          likeCount:0
      };

      const findLikeCount:IfindLikeCount | undefined = likeCountArr.find((likeUnit:any) => {return likeUnit.postId === targetPost.id});
      
      if (findLikeCount) {
          form.likeCount = findLikeCount.likeCount
      }

      return form;
  })
  return result;
};
 

};

Comments.init({
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
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  }
}, {
  sequelize,
  modelName: 'comments',
  tableName: 'comments',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updatedAt'
});

Users.hasMany(Comments, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyComments'
});
Comments.belongsTo(Users, {
  foreignKey: 'userId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'commentsBelongsToUser',
});


Posts.hasMany(Comments, {
  foreignKey: 'postId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'posthasManyComments'
});
Comments.belongsTo(Posts, {
  foreignKey: 'postId',
  targetKey: 'id',
  onDelete: 'CASCADE',
  as: 'commentsBelongsToPost',
});