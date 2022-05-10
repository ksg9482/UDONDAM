import {Likes} from '../../models/likes'

console.log("======Create Likes Table======");

const create_tables_likes = async () => {
  await Likes.sync({force:true})
  .then(()=>{
    console.log('likes success');
  })
  .catch((err)=>{
    console.log('likes error:', err);
  })
}

create_tables_likes();