import { Tags } from "../../models/tags.model"; 

console.log("======Create Tags Table======");

const create_table_tags = async () => {
  await Tags.sync({force:true})
  .then(()=>{console.log('tags success')})
  .catch((err)=>{console.log('tags error:',err)})
};
create_table_tags();