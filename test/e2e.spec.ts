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
    //await sequelize.sync({ force: true }); //데이터베이스를 초기화한다.
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

    describe('POST /guest', () => {
      it('게스트 로그인시 토큰이 발급되어야 한다', async () => {
        const resp: any = await request(app).post('/guest');
        const token = tokenData(resp);

        expect(resp.status).toEqual(200);
        expect(resp.body.data).toEqual({ "manager": false, "nickname": "게스트", "socialType": "basic", "userId": 5 });
        expect(token).toEqual(expect.any(String));
      })
    });

    describe('POST /login', () => {
      it('올바른 형식의 로그인은 성공해야 한다', async () => {
        const resp: any = await request(app).post('/login').send(loginTest.testUser);
        const token = tokenData(resp);

        expect(resp.status).toEqual(200);
        expect(resp.body.data).toEqual({ "userId": 1, "nickname": "익명", "area": "인증해주세요", "area2": "인증해주세요", "manager": false, "socialType": "basic" });
        expect(token).toEqual(expect.any(String));

        jwtToken = token;
      });

      it('매칭되는 유저가 없으면 실패해야 한다', async () => {
        const resp: any = await request(app).post('/login').send(loginTest.wrongUser);

        expect(resp.status).toEqual(401);
        expect(resp.body).toEqual({ "message": "Invalid email or password" });
      });
    });


    describe('GET /logout', () => {
      it('정상적으로 로그아웃 되어야 한다', async () => {
        const resp: any = await request(app).get('/logout').set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "logout!" });
      });
      //catch로 빠지는건 어떻게?
    });

    describe('POST /emailCheck', () => {
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

    describe('GET /user', () => {
      it('올바른 userId가 토큰에 담겨 있으면 user 정보 조회에 성공한다', async () => {
        const resp: any = await request(app).get('/user').set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "userId": 1, "nickname": "익명", "area": "인증해주세요", "area2": "인증해주세요", "email": "test@test.com", "manager": false, "socialType": "basic" });
      });

    });

    describe('PATCH /user', () => {
      const patchData = {
        nickname: '익명patch',
        password: '12345patch'
      };
      it('nickname만 바꿀 수 있다', async () => {
        const resp: any = await request(app).patch('/user').set('Cookie', [jwtToken]).send({ nickname: patchData.nickname });

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "nickname patched!" });
      });

      it('password만 바꿀 수 있다', async () => {
        const resp: any = await request(app).patch('/user').set('Cookie', [jwtToken]).send({ password: patchData.password });

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "password patched!" });
      });

      it('nickname, password 동시에 바꿀 수 있다', async () => {
        const resp: any = await request(app).patch('/user').set('Cookie', [jwtToken]).send({ nickname: patchData.nickname, password: patchData.password });

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "user patched!" });
      });

      it('아무 patch data도 포함되지 않으면 실패한다', async () => {
        const resp: any = await request(app).patch('/user').set('Cookie', [jwtToken]).send();

        expect(resp.status).toEqual(400);
        expect(resp.body).toEqual({ "message": "no data has been sent!" });
      });

    });

    describe('PATCH /user/area', () => {
      const patchData = {
        area: '서울특별시',
        area2: '인천광역시'
      };

      it('아무 patch data도 포함되지 않으면 실패한다', async () => {
        const resp: any = await request(app).patch('/user/area').set('Cookie', [jwtToken]).send();

        expect(resp.status).toEqual(400);
        expect(resp.body).toEqual({ "message": "no data has been sent!" });
      });

      it('area에 올바른 area data를 보내면 성공한다', async () => {
        const resp: any = await request(app).patch('/user/area').set('Cookie', [jwtToken]).send({ area: patchData.area });

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "area": "서울특별시" });
      });

      it('area2에 올바른 area data를 보내면 성공한다', async () => {
        const resp: any = await request(app).patch('/user/area').set('Cookie', [jwtToken]).send({ area: patchData.area2 });

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "area": "인천광역시" });
      });

    });

    describe('DELETE /user', () => {
      //userDelete가 끝나면 sign up으로 유저 재생성함. patch test로 변경한 데이터는 적용되어 있지 않음. 
      afterEach(async () => {
        await request(app).post('/signup').send(loginTest.testUser);
        const userLogin: any = await request(app).post('/login').send(loginTest.testUser);
        const token = tokenData(userLogin);
        jwtToken = token;
      })

      it('delete 메서드로 요청을 보내면 user data가 삭제된다', async () => {
        const resp: any = await request(app).delete('/user').set('Cookie', [jwtToken]);
        
        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": 'delete!' });
      });
    });

  });

  describe('PostsController(e2e)', () => {
    const postTest = {
      content:"testContent",
      public:true,
      tag:["서울특별시", "공부", "도서관"]
    }
    const wrongPostTest = {
      content:"testContent",
      public:true
    }
    
    describe('POST /post', () => {
      it('정상적인 데이터를 보내면 성공해야 한다', async () => {
        const resp: any = await request(app).post('/post').set('Cookie', [jwtToken]).send(postTest);

        expect(resp.status).toEqual(200)
        expect(resp.body).toEqual({"message" : "create!"})
      });

      it('content 또는 public 또는 tag가 포함되지 않으면 실패한다', async () => {
        const resp: any = await request(app).post('/post').set('Cookie', [jwtToken]).send(wrongPostTest);

        expect(resp.status).toEqual(400);
        expect(resp.body).toEqual({ "message": "no data has been sent!" });
      });

    });
    describe('GET /post', () => {
      it('정상적인 데이터를 보내면 성공해야 한다', async () => {
        const resp: any = await request(app).get('/post').set('Cookie', [jwtToken]).query('size=10').query('page=0').query({tag:["서울특별시", "공부", "도서관"]});
        
        expect(resp.status).toEqual(400);
      })
    });
    it.todo('GET /post/user');
    it.todo('GET /post/:postId');
    it.todo('DELETE /post/:postId');
  })

});

