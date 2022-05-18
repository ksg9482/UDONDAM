import * as dotenv from 'dotenv';

// let path;
// switch(process.env.NODE_ENV) {
//   case "production":
//     path = `${__dirname}/../../.env`;
//     break;
//   case "dev":
//     path = `${__dirname}/../../.env`;
//     break;
//   case "test":
//     path = `${__dirname}/../../.env.test`;
//     break;
// }
// dotenv.config({path: path});

dotenv.config();
export const config = {
  development: {
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "UDONDAM",
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: process.env.DATABASE_PORT || "3306",
    dialect: "mysql",
    timezone: "+09:00"
  },
  test: {
    username: process.env.DATABASE_USERNAME_TEST || "",
    password: process.env.DATABASE_PASSWORD_TEST || "",
    database: process.env.DATABASE_NAME_TEST ||"UDONDAMTEST",
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: process.env.DATABASE_PORT || "3306",
    dialect: "mysql",
    timezone: "+09:00"
  },
  production: {
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "UDONDAM",
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: process.env.DATABASE_PORT || "3306",
    dialect: "mysql",
    timezone: "+09:00"
  }
}
