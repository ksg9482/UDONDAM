
import {Users} from "../../models/users.model";

console.log("======Create Users Table======");

const create_table_users = async () => {
  await Users.sync({force:true})
  .then(()=>{
    console.log('users success');
  })
  .catch((err)=>{
    console.log('users error:', err);
  });
};

create_table_users();
