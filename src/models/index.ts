import Sequelize from 'sequelize';
import { config } from '../config/config';

const env = process.env.NODE_ENV;

const sequelize = env === 'test'
  ? (new Sequelize.Sequelize(
    config.test.database,
    config.test.username,
    config.test.password,
    {
      host: config.test.host,
      dialect: 'mysql',
      timezone: '+09:00',
      logging: false
    }
  ))
  : (new Sequelize.Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
      host: config.development.host,
      dialect: 'mysql',
      timezone: '+09:00',
      logging: false
    }
  ));

export default sequelize;
