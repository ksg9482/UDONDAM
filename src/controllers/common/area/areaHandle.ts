import { Users } from "../../../models/users.model";
import { areaData } from "./areaData";

export interface Iarea {
    area?: string;
    area2?: string;
}

export const isArea = (area: string) => {
    const matchArea = areaData.find((el) => {
        return el === area
    });
   
    return matchArea ? true : false;
};

export const areaUpdate = async (userId: number, targetArea: Iarea) => {  
    const result = await Users.update(
        targetArea,
        {
            where: {
                id: userId
            }
        })
        
    return result
}