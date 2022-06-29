import {
  DataTypes,
  Model
} from 'sequelize';
import sequelize from './index';
import { Posts_Tags } from './posts_tags.model';
import { Op } from 'sequelize'
import { Posts } from './posts.model';
import { isArea } from '../controllers/common/area/areaHandle';

export interface ItagsAttributes {
  id?: number,
  content?: string,
};

export class Tags extends Model<ItagsAttributes> {

  readonly id?: number;
  content?: string;

  public static associations: {};

  static createTag = async (insertTagArr:any) => {

    interface IresultObj {
      tagId:number[]
    }

    const resultObj:IresultObj = {tagId:[]};

    for(let tag of insertTagArr) {
        const result: any = await this.findOrCreate({
            attributes: ['id', 'content'],
            where: {
                content: tag
            },
            raw: true
        });

        if(!result || result.length === 0) {
          continue;
        }
        const extractTagId = result[0].id
        resultObj.tagId.push(extractTagId);
    }
    
    return resultObj;
};

  static setTagGroup = (inputTagArr: Array<string>) => {
    const areaTag = [];
    const contentTag = [];

    for (let tag of inputTagArr) {
        //'육군' 처럼 area가 아님에도 '군'이나 '시'로 끝나는 태그 식별        
        isArea(tag) ? areaTag.push(tag) : contentTag.push(tag)
    }

    return { areaTag, contentTag }
}
  
};


Tags.init({
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'tags',
  tableName: 'tags',
  freezeTableName: true,
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updatedAt'
});


