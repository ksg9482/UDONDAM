import { App } from '../src';

import sequelize from '../src/models';
import request from 'supertest';

export let jwtToken: string;

const app = new App().app

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
  wrongEmail: {
    email: "wrong@wrong.com",
    password: "12345"
  },
  wrongPassword: {
    email: "test@test.com",
    password: "123457890"
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

const testUserArr = [
  {
    email: "test1@test.com",
    password: "12345"
    
  },
  {
    email: "test2@test.com",
    password: "12345"
    
  },
  {
    email: "test3@test.com",
    password: "12345"
    
  }
];



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
        for (let testUser of testUserArr) {
          await request(app).post('/signup').send(testUser);
        }
        expect(resp.status).toEqual(201);
        expect(resp.body).toEqual({ message: 'Sign Up!' });
      })
    });

    describe('POST /guest', () => {
      it('게스트 로그인시 토큰이 발급되어야 한다', async () => {
        const resp: any = await request(app).post('/guest');
        const token = tokenData(resp);

        expect(resp.status).toEqual(200);
        expect(resp.body.data).toEqual({ "manager": false, "nickname": "게스트", "socialType": "basic", "userId": 5, "area": "인증해주세요", "area2": "인증해주세요" });
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

      it('잘못된 이메일로 로그인을 시도하면 실패해야 한다', async () => {
        const resp: any = await request(app).post('/login').send(loginTest.wrongEmail);

        expect(resp.status).toEqual(401);
        expect(resp.body).toEqual({ "message": "Invalid email" });
      });

      it('잘못된 비밀번호로 로그인을 시도하면 실패해야 한다', async () => {
        const resp: any = await request(app).post('/login').send(loginTest.wrongPassword);

        expect(resp.status).toEqual(401);
        expect(resp.body).toEqual({ "message": "Invalid password" });
      });
    });


    describe('GET /logout', () => {
      it('정상적으로 로그아웃 되어야 한다', async () => {
        const resp: any = await request(app).get('/logout').set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "logout!" });
      });
      
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

      it('area에 올바르지 않은 area data를 보내면 실패한다', async () => {
        const resp: any = await request(app).patch('/user/area').set('Cookie', [jwtToken]).send({ area: '원시근시난시' });

        expect(resp.status).toEqual(400);
        expect(resp.body).toEqual({ "message": "Invalid Area" });
      });

      it('area에 올바른 area data를 보내면 성공한다', async () => {
        const resp: any = await request(app).patch('/user/area').set('Cookie', [jwtToken]).send({ area: patchData.area });

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ area: '서울특별시' });
      });

      it('area2에 올바른 area data를 보내면 성공한다', async () => {
        const resp: any = await request(app).patch('/user/area').set('Cookie', [jwtToken]).send({ area2: patchData.area2 });

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ area2: '인천광역시' });
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
    afterEach((async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
    }))
    const postTest = {
      content: "testContent1",
      public: true,
      tag: ["서울특별시", "공부", "도서관"]
    };
    const postTest2 = {
      content: "검색용으로 들어감",
      public: true,
      tag: ["서울특별시", "게임", "공원"]
    };
    const wrongPostTest = {
      content: "testContent",
      public: true
    }
    const testPosts = [
      {
        content: "testContent2",
        public: true,
        tag: ["서울특별시", "게임", "공원"]
      },
      {
        content: "testContent3",
        public: true,
        tag: ["인천광역시"]
      },
      {
        content: "testContent4",
        public: true,
        tag: ["서울특별시"]
      },
      {
        content: "testContent5",
        public: true,
        tag: ["서울특별시", "게임"]
      },
      {
        content: "testContent6",
        public: true,
        tag: ["서울특별시", "공원"]
      },
      {
        content: "testContent7",
        public: true,
        tag: ["인천광역시","게임", "도서관"]
      },
    ];
    const testComment = [
      {
        postId: 2,
        content: 'testComment1',
        commentId: null
      },
      {
        postId: 2,
        content: 'testComment2',
        commentId: null
      },
      {
        postId: 5,
        content: 'testComment3',
        commentId: null
      },
      {
        postId: 6,
        content: 'testComment4',
        commentId: null
      },
      {
        postId: 2,
        content: 'testReComment1',
        commentId: 1
      },
      {
        postId: 2,
        content: 'testReComment2',
        commentId: 2
      },
      {
        postId: 5,
        content: 'testReComment3',
        commentId: 3
      }
    ];
    
    
    

    describe('POST /post', () => {
      it('정상적인 데이터를 보내면 성공해야 한다', async () => {

        const testUserTokenArr: any = {
          'loginToken1': '',
          'loginToken2': '',
          'loginToken3': ''
        };
        const testInputArr = [
          {token:'loginToken1', postId:{postId: 2}},
          {token:'loginToken2', postId:{postId: 2}},
          {token:'loginToken3', postId:{postId: 5}},
          {token:'loginToken1', postId:{postId: 5}},
          {token:'loginToken2', postId:{postId: 5}},
        ];

        const resp: any = await request(app).post('/post').set('Cookie', [jwtToken]).send(postTest);

        //토큰 할당하는 기능
        for (let testUser of testUserArr) {
          const testResp = await request(app).post('/login').send(testUser);
          const testToken = tokenData(testResp);
          const userEmail = testUser.email.split('@')[0];
          const emailNumber = Number(userEmail.slice(userEmail.length-1))

          testUserTokenArr[`loginToken${emailNumber}`] = testToken;
        };

        for(let post of testPosts) {
          await request(app).post('/post').set('Cookie', [jwtToken]).send(post);
        }
        for(let comment of testComment) {
          await request(app).post('/comment').set('Cookie', [jwtToken]).send(comment);
        }
        for (let testInput of testInputArr) {
          const token = testUserTokenArr[testInput.token]
          await request(app).post('/likes').set('Cookie', [token]).send(testInput.postId);
        };
        await request(app).post('/likes').set('Cookie', [testUserTokenArr['loginToken3']]).send({ postId: 2});
        //await request(app).post('/likes').set('Cookie', [jwtToken]).send({ postId: 2 });
        
        expect(resp.status).toEqual(201)
        expect(resp.body).toEqual({ "message": "create!" })
      });

      it('content 또는 public 또는 tag가 포함되지 않으면 실패한다', async () => {
        const resp: any = await request(app).post('/post').set('Cookie', [jwtToken]).send(wrongPostTest);

        expect(resp.status).toEqual(400);
        expect(resp.body).toEqual({ "message": "no data has been sent!" });
      });

    });
    describe('GET /post', () => {
      it('정상적인 데이터를 보내면 성공해야 한다', async () => {
        const resp: any = await request(app).get('/post').set('Cookie', [jwtToken]).query('size=10').query('page=0').query({ tag: ["서울특별시", "게임", "공원"] }).query({ notTag: ["도서관"] });

        expect(resp.status).toEqual(200);
        expect(resp.body[0].content).toEqual("testContent1");
        expect(resp.body[0].tag).toBeTruthy();
      });

      it('areaTag가 없으면 빈 배열이 return되어야 한다', async () => {
        const resp: any = await request(app).get('/post').set('Cookie', [jwtToken]).query('size=10').query('page=0').query({ tag: ["공부", "도서관"] });

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual([]);
      });
    });

    describe('GET /post/user', () => {
      it('userId에 해당하는 postData가 return되어야 한다', async () => {
        const extraPost: any = await request(app).post('/post').set('Cookie', [jwtToken]).send(postTest2);
        const resp: any = await request(app).get('/post/user').set('Cookie', [jwtToken]);
        
        expect(resp.status).toEqual(200);
        expect(resp.body[0].content).toBeTruthy();
        expect(resp.body[1].content).toBeTruthy();
      });
    });

    describe('GET /post/:postId', () => {
      it('해당하는 id의 post가 return되어야 한다', async () => {
        const resp: any = await request(app).get(`/post/${2}`).set('Cookie', [jwtToken]);
        
        expect(resp.status).toEqual(200);
        expect(resp.body.id).toEqual(2);
      });
    });

    describe('DELETE /post/:postId', () => {
      it('해당하는 id의 post가 delete되어야 한다', async () => {
        const resp: any = await request(app).delete(`/post/${2}`).set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "delete!" });
      });

      it('해당하지 않는 id의 post가 delete는 실패해야 한다', async () => {
        const resp: any = await request(app).delete(`/post/${4}`).set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(400);
        expect(resp.body).toEqual({ "message": "post doesn't exist" });
      });
    });
  });

  describe('LikesController(e2e)', () => {
    describe('POST /likes', () => {
      it('해당하는 postId를 입력하면 like처리가 되어야 한다', async () => {
        const resp: any = await request(app).post('/likes').set('Cookie', [jwtToken]).send({ postId: 1 });

        expect(resp.status).toEqual(201);
        expect(resp.body).toEqual({ "message": "created" });
      });

      it('해당하는 postId에 like요청이 중복되면 이미 처리되었다고 안내되어야 한다', async () => {
        const resp: any = await request(app).post('/likes').set('Cookie', [jwtToken]).send({ postId: 1 });

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "이미 따봉을 한 상태입니다." });
      });

    });

    describe('GET /likes', () => {
      it('해당하는 userId가 like처리한 post를 알 수 있어야 한다', async () => {
        
        const resp: any = await request(app).get('/likes').set('Cookie', [jwtToken]);
        
        expect(resp.status).toEqual(200);
        expect(resp.body[0].id).toEqual(1);
        expect(resp.body[0].likeCount).toEqual(1);
      });
    });

    describe('DELETE /likes/:postId', () => {
      it('해당하는 like처리를 취소 할 수 있어야 한다', async () => {
        const resp: any = await request(app).delete(`/likes/${1}`).set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "delete!" });
      });

      it('해당하는 like 취소 처리가 중복되면 이미 처리되었다고 안내되어야 한다', async () => {
        const resp: any = await request(app).delete(`/likes/${1}`).set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "이미 따봉을 취소한 상태입니다." });
      });
    });

  });

  describe('CommentsController(e2e)', () => {
    const commentData = {
      postId: 1,
      content: 'testComment',
      commentId: null
    };
    const reCommentData = {
      postId: 1,
      content: 'testReComment!',
      commentId: 1
    };
    



    describe('POST /comment', () => {
      it('정확한 데이터를 입력하면 성공해야 한다', async () => {
        const resp: any = await request(app).post('/comment').set('Cookie', [jwtToken]).send(commentData);

        expect(resp.status).toEqual(201);
        expect(resp.body).toEqual({ "message": "created!" });
      });

      it('commentId에 데이터가 있어도 성공해야 한다', async () => {
        const resp: any = await request(app).post('/comment').set('Cookie', [jwtToken]).send(reCommentData);

        expect(resp.status).toEqual(201);
        expect(resp.body).toEqual({ "message": "created!" });
      });

    });

    describe('GET /comment', () => {
      it('userId가 작성한 comment가 있는 post를 return해야 한다', async () => {
        const resp: any = await request(app).get('/comment').set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(200);
        expect(resp.body[0].content).toEqual("testContent1");
      });

    });

    describe('DELETE /comment/:commentId', () => {
      it('해당하는 comment가 삭제되어야 한다', async () => {
        const resp: any = await request(app).delete(`/comment/${1}`).set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(200);
        expect(resp.body).toEqual({ "message": "delete!" });
      });

    });
  });

  describe('RecentController(e2e)', () => {

    const recentData = {
      tag: ["서울특별시", "공부", "도서관"],
      notTag: null
    };
    const recentNotTagData = {
      tag: ["서울특별시", "학교", "식당"],
      notTag: ["교실"]
    };
    describe('POST /recent', () => {
      beforeEach(async () => {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
      });

      it('정확한 데이터를 입력하면 성공해야 한다', async () => {
        const resp: any = await request(app).post('/recent').set('Cookie', [jwtToken]).send(recentData);

        expect(resp.status).toEqual(201);
        expect(resp.body).toEqual({ "message": "recentsearch created" });
      });

      it('notTag가 null이 아니여도 성공해야 한다', async () => {

        const resp: any = await request(app).post('/recent').set('Cookie', [jwtToken]).send(recentNotTagData);

        expect(resp.status).toEqual(201);
        expect(resp.body).toEqual({ "message": "recentsearch created" });
      });
    });

    describe('GET /recent', () => {
      it('입력한 recent를 조회 할 수 있어야 한다', async () => {
        const resp: any = await request(app).get('/recent').set('Cookie', [jwtToken]);

        expect(resp.status).toEqual(200);
        expect(resp.body).toBeTruthy();
      });

    });


  });


});

