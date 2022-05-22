import { Posts_Tags } from "../../models/posts_tags.model"; 

console.log("======Create Posts_Tags Table======");

const create_table_posts_tags = async () => {
  await Posts_Tags.sync({force:true})
  .then(()=>{
    console.log('posts_tags success');
  })
  .catch((err)=>{
    console.log('posts_tags error:', err);
  });
};

create_table_posts_tags();