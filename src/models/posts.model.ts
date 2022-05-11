import {
  DataTypes, 
  Model, 
  Optional, 
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  Association, 
  Sequelize} from 'sequelize';
import { Comments } from './comments.model';
import  sequelize  from './index';
import { Likes } from './likes.model';
import { RecentSearchs } from './recentsearchs.model';
import { Tags } from './tags.model';
import { Users } from './users.model';

  export interface IpostsAttributes {
    id: number,
    content: string,
    userId: number,
    public: boolean,
    //createdAt: Date,
    //updatedAt: Date
  }

// export type postsPk = "id";
// export type postsId = Posts[postsPk];
// export type postsOptionalAttribues = 
// "id" 
// | "content" 
// | "userId"
// | "public"
// | "createdAt"
// | "updatedAt"; 
// export type postsCreationAttributes = Optional<IpostsAttributes,postsOptionalAttribues>

  export class Posts extends Model<IpostsAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     public readonly id?: number;
     public content?: string;
     public userId?: number;
     public public?: boolean;
   
     //public readonly createdAt?: Date;
     //public readonly updatedAt?: Date;
     
     public static associations: {
      userHasManyPost: Association<Users, Posts>,
      postsbelongsToUsers: Association<Posts, Users>,

      
      
      
    }
    
  };
  
  //static initModel(sequelize: Sequelize): typeof Posts {
    Posts.init({
      id: {
        autoIncrement:true,
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
      },
      // createdAt:{
      //   type: DataTypes.DATE,
      //   allowNull: false
      // },
      // updatedAt:{
      //   type: DataTypes.DATE,
      //   allowNull: false
      // }
    }, {
      sequelize,
      modelName: 'posts',
      tableName: 'posts',
      freezeTableName: true,
      timestamps: true,
      //createdAt: true,
      updatedAt: 'updatedAt'
    });
  //   return Posts;
  // }

  Users.hasMany(Posts, {
  foreignKey: 'userId',
  sourceKey: 'id',
  onDelete: 'CASCADE',
  as: 'userHasManyPost'
});
  Posts.belongsTo(Users, {
    foreignKey: 'userId',
    targetKey: 'id',
    //sourceKey: 'id',
    onDelete: 'CASCADE',
    as: 'postsbelongsToUsers',
  });


