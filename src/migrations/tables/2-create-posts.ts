import { Posts } from "../../models/posts.model"; 

console.log("======Create Posts Table======");

const create_table_posts = async () => {
  await Posts.sync({force:true})
  .then(()=>{
    console.log('posts success');
  })
  .catch((err)=>{
    console.log('posts error:', err);
  });
};

create_table_posts();