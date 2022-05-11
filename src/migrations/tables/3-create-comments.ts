import {Comments} from '../../models/comments.model'

console.log("======Create Comments Table======");

const create_tables_comments = async () => {
  await Comments.sync({force:true})
  .then(()=>{
    console.log('comments success');
  })
  .catch((err)=>{
    console.log('comments error:', err);
  })
}

create_tables_comments();