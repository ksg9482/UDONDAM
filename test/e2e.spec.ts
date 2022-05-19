import app from '../src';

import sequelize from '../src/models';
import request from 'supertest';

export let jwtToken: string;



export const tokenData = (res: any) => {
  //console.log(res)
  const token: string = res.headers["set-cookie"][0].split(';')[0];
  //console.log(token)
  jwtToken = token;
  return token ? token : 'search error';
};

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

const userData = {
  testUser: {
    email: "test@test.com",
    password: "12345",
    userId: 1,
    nickname: "익명",
    area: "인증해주세요",
    area2: "인증해주세요",
    manager: false,
    socialType: "basic"
  },
  wrongUser: {
    email: "wrong@wrong.com",
    password: "1wrong5"
  }
};

describe('e2e-test', () => {
  beforeAll(async () => {
    await sequelize.sync()
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    await sequelize.sync({ force: true }); //데이터베이스를 초기화한다.
    sequelize.close();
    console.log('test finish.')
  });


  describe('AuthController(e2e)', () => {
    describe('POST /signup', () => {

      it('연결 확인', async () => {
        const nodeEnv = process.env.NODE_ENV
        const resp: any = await request(app).get('/');

        expect(resp.status).toEqual(200);
        expect(resp.text).toEqual('get 응답');
      });

      it('회원가입', async () => {
        const resp: any = await request(app).post('/signup').send(loginTest.testUser);

        expect(resp.status).toEqual(201);
        expect(resp.body).toEqual({ message: 'signUp!' });
      })
    });

    describe('guest', () => {
      it('게스트 로그인시 토큰이 발급되어야 한다', async () => {
        const resp: any = await request(app).post('/guest');
        const token = tokenData(resp);

        expect(resp.status).toEqual(200);
        expect(resp.body.data).toEqual({ "manager": false, "nickname": "게스트", "socialType": "basic", "userId": 5 });
        expect(token).toEqual(expect.any(String));
      })
    });

    describe('login', () => {
      it('올바른 형식의 로그인은 성공해야 한다', async () => {
        const resp: any = await request(app).post('/login').send(loginTest.testUser);
        const token = tokenData(resp);

        expect(resp.status).toEqual(200);
        expect(resp.body.data).toEqual({"userId":1,"nickname":"익명","area":"인증해주세요","area2":"인증해주세요","manager":false,"socialType":"basic"});
        expect(token).toEqual(expect.any(String));

        jwtToken = token;
      });

      it('매칭되는 유저가 없으면 실패해야 한다', async () => {
        const resp: any = await request(app).post('/login').send(loginTest.wrongUser);

        expect(resp.status).toEqual(401);
        expect(resp.body).toEqual({ "message": "Invalid email or password" });
      });
    });


    describe('logout', () => {
      it('정상적으로 로그아웃 되어야 한다', async () => {
        const resp: any = await request(app).get('/logout').set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "logout!" });
      });
      //catch로 빠지는건 어떻게?
    });

    describe('emailCheck', () => {
      it('DB에 없는 email이면 통과해야 한다', async () => {
        const resp: any = await request(app).post('/emailcheck').send(emailCheckTest.testEmail);

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "ok!" });
      });

      it('DB에 존재하는 email이면 실패해야 한다', async () => {
        const resp: any = await request(app).post('/emailcheck').send(emailCheckTest.alreadyEmail);

        expect(resp.status).toEqual(409);
        expect(resp.body).toEqual({ "message": "Email already exists" });
      });
    });
  });

  describe('UsersController(e2e)', () => {

    const testUserId = '1';

    describe('userInfo', () => {
      it('올바른 userId가 토큰에 담겨 있으면 user 정보 조회에 성공한다', async () => {
        const resp: any = await request(app).get('/user').set('Cookie', [jwtToken]);
       
        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "userId": 1, "nickname": "익명", "area": "인증해주세요", "area2": "인증해주세요", "email": "test@test.com", "manager": false, "socialType": "basic" });
      });

    });

    describe('userPatch', () => {
      const patchData = {
        nickname: '익명',
        password: '12345patch'
      };
      it('nickname만 바꿀 수 있다', async () => {
        const resp: any = await request(app).patch('/user').set('Cookie', [jwtToken]).send();
       
      });
      it.todo('password만 바꿀 수 있다');
      it.todo('nickname, password 동시에 바꿀 수 있다');
      
    });
/*
jest를 이용한 테스트의 반복실행

테스트마다 반복 실행-
beforeEach / afterEach와 동일 레벨 또는 하위 레벨의 테스트가 실행될 때 마다 반복적으로 실행된다
비동기 함수일 경우 일반 테스트 함수와 동일하게 처리된다

딱 한번 실행-
beforeAll / afterAll과 동일 레벨 또는 하위 레벨의 테스트가 실행될 때 딱 한번만 실행한다

test시 주의사항
 * 테스트가 실패할 때 테스트를 개별로 실행했을 때 실패하는지 확인해야 한다
 * 해당 테스트 임시실행은 only 키워드를 적용한다
 * 어떤 테스트가 다른 테스트에 영향을 받아 실패하는 경우가 있다
 * beforeEach를 사용하면 해당테스트 전의 상태를 확인 할 수 있다

*/
    it.todo('areaPatch');

    it.todo('userDelete');

  });

});

