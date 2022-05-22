import { RecentSearchs } from "../../models/recentsearchs.model"; 

console.log("======Create RecentSearchs Table======");

const create_table_resentSearch = async () => {
  await RecentSearchs.sync({force:true})
  .then(()=>{
    console.log('resentSearch success');
  })
  .catch((err)=>{
    console.log('resentSearch error:', err);
  });
};

create_table_resentSearch();