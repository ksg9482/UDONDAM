import Sequelize from 'sequelize';
import fs from 'fs';
import app, { HOST, PORT } from '../src';

import sequelize from '../src/models';
import { Users } from '../src/models/users.model';

//import {} from '../src/models';//
import request from 'supertest';



describe('AuthController(e2e)', () => {

  afterAll(async () => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    
    //await sequelize.dropAllSchemas({logging:false}) 스키마를 다 지워서 테이블 자체가 사라짐. 테이블만 없애려면?
  });

  const testUser = {
    email: "test@test.com",
    password: "12345"
  };

  describe('signup', () => {

    it('연결 확인', async () => {
      const nodeEnv = process.env.NODE_ENV
      //console.log(nodeEnv)
      const res:any = await request(app).get('/');//.post('/user').send(testUser)
      //console.log(res)
      expect(res.status).toEqual(200);
      expect(res.text).toEqual('get 응답');
    });

    // it('회원가입', async () => {
    //   const res:any = await request(app).post('/signup').send(testUser);
    //   console.log(res);
    //   expect(res.status).toEqual(201);
    //   expect(res.body).toEqual({ message: 'signUp!' });
    // })
  })
})