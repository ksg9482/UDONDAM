import app from '../src';

import sequelize from '../src/models';
import request from 'supertest';



describe('AuthController(e2e)', () => {
  beforeAll(async () => {
    await sequelize.sync()
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    await sequelize.sync({ force: true }); //데이터베이스를 초기화한다.
    sequelize.close();});

  const loginTest = {
    testUser: {
      email: "test@test.com",
      password: "12345"
    },
    wrongUser: {
      email: "wrong@wrong.com",
      password: "1wrong5"
    }
  };

  const emailCheckTest = {
    testEmail: {
      email: "test123@test123.com",
    },
    alreadyEmail: {
      email: "test@test.com",
    }
  };

  let jwtToken: string;

  describe('POST /signup', () => {

    it('연결 확인', async () => {
      const nodeEnv = process.env.NODE_ENV
      const res:any = await request(app).get('/');
      
      expect(res.status).toEqual(200);
      expect(res.text).toEqual('get 응답');
    });

    it('회원가입', async () => {
      const res:any = await request(app).post('/signup').send(loginTest.testUser);
      
      expect(res.status).toEqual(201);
      expect(res.body).toEqual({ message: 'signUp!' });
    })
  });

  describe('login',  () => {
    it('올바른 형식의 로그인은 성공해야 한다', async () => {
      const res:any = await request(app).post('/login').send(loginTest.testUser);
      const [_, token]:string = res.headers["set-cookie"][0].split(';')[0].split('=');
      
      expect(res.status).toEqual(200);
      expect(res.body.data).toEqual({"userId":1,"nickname":"익명","area":"인증해주세요","area2":"인증해주세요","manager":false,"socialType":"basic"});
      expect(token).toEqual(expect.any(String));
      
      jwtToken = token;
    });
    
    it('매칭되는 유저가 없으면 실패해야 한다', async () => {
      const res:any = await request(app).post('/login').send(loginTest.wrongUser);
    
      expect(res.status).toEqual(401);
      expect(res.body).toEqual({"message": "Invalid email or password"});
    });
  });
  
describe('guest', () => {
  it('게스트 로그인시 토큰이 발급되어야 한다', async () => {
    const res:any = await request(app).post('/guest');
    const [_, token]:string = res.headers["set-cookie"][0].split(';')[0].split('=');
      
    expect(res.status).toEqual(200);
    expect(res.body.data).toEqual({"manager": false, "nickname": "게스트", "socialType": "basic", "userId": 5});
    expect(token).toEqual(expect.any(String));
  })
});

describe('logout', () => {
  it('정상적으로 로그아웃 되어야 한다', async () => {
    const res:any = await request(app).get('/logout').set('jwt', jwtToken);
    
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({"message": "logout!"});
  });
//catch로 빠지는건 어떻게?
});

describe('emailCheck', () => {
  it('DB에 없는 email이면 통과해야 한다', async() => {
    const res:any = await request(app).post('/emailcheck').send(emailCheckTest.testEmail);
    
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ "message": "ok!"});
  });

  it('DB에 존재하는 email이면 실패해야 한다', async () => {
    const res:any = await request(app).post('/emailcheck').send(emailCheckTest.alreadyEmail);
    
    expect(res.status).toEqual(409);
    expect(res.body).toEqual({ "message": "Email already exists"});
  });
});
});