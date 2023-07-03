import {Test} from "@nestjs/testing";
import {AppModule} from "../src/app.module";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {PrismaService} from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import {AuthDto} from "../src/auth/dto";
import {EditUserDto} from "../src/user/dto/edit-user.dto";
import {CreateBookmarkDto, EditBookmarkDto} from "../src/bookmark/dto";

describe('App e2e', function () {

  let app: INestApplication;

  let prisma: PrismaService;

  beforeAll(async ()=> {
    const moduleRef = await Test.createTestingModule({
      imports:[AppModule]
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe(
        {
          whitelist:true
        }
    ))

    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);

    await prisma.cleaDb();

    pactum.request.setBaseUrl('http://localhost:3000');
  })

  afterAll(() => {
    app.close();
  })

  describe('Auth',() =>{

    const dto:AuthDto = {
      email: 'diego@test.com',
      password: '123'
    }

    describe('SignUp', () => {

      it('should throw if email empty', () => {

        return pactum
            .spec()
            .post('/auth/signup')
            .withBody({
              password:dto.password
            })
            .expectStatus(400);

      });

      it('should throw if password empty', () => {

        return pactum
            .spec()
            .post('/auth/signup')
            .withBody({
              email:dto.email
            })
            .expectStatus(400);

      });

      it('should throw if body empty', () => {

        return pactum
            .spec()
            .post('/auth/signup')
            .expectStatus(400);

      });

      it('should Sign up', () => {

        return pactum
            .spec()
            .post('/auth/signup')
            .withBody(dto)
            .expectStatus(201);

      });

    })

    describe('SignIN', () => {

      it('should throw if email empty', () => {

        return pactum
            .spec()
            .post('/auth/signin')
            .withBody({
              password:dto.password
            })
            .expectStatus(400);

      });

      it('should throw if password empty', () => {

        return pactum
            .spec()
            .post('/auth/signin')
            .withBody({
              email:dto.email
            })
            .expectStatus(400);

      });

      it('should throw if body empty', () => {

        return pactum
            .spec()
            .post('/auth/signin')
            .expectStatus(400);

      });

      it('should Sign in', () => {

        return pactum
            .spec()
            .post('/auth/signin')
            .withBody(dto)
            .expectStatus(200)
            .stores('userAt', 'access_token');
      });
    })
  })

  describe('User',() =>{

    describe('GetMe', () => {

      it('should get current user', () => {
        return pactum
            .spec()
            .get('/users/me')
            .withHeaders({
              'Authorization' : 'Bearer $S{userAt}'
            })
            .expectStatus(200);
      })
    })

    describe('Edit User', () => {

      it('should edit current user', () => {
        const dto:EditUserDto = {
          firstName: 'Diego',
          email: 'diego@admin.com'
        }

        return pactum
            .spec()
            .patch('/users')
            .withBody(dto)
            .withHeaders({
              'Authorization' : 'Bearer $S{userAt}'
            })
            .expectStatus(200)
            .expectBodyContains(dto.firstName)
            .expectBodyContains(dto.email);
      })
    })

  })

  describe('Bookmarks',() =>{

    describe('Get empty bookmarks', () => {

      it('should get empty bookmarks', () => {

        return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({
              'Authorization' : 'Bearer $S{userAt}'
            })
            .expectStatus(200)
            .expectBody([]);

      })
    })

    describe('Create Bookmark', () => {

      const dto: CreateBookmarkDto = {
        title: "Recommended course",
        description: 'Free yt course',
        link: "https://www.youtube.com/watch?v=GHTA143_b-s"
      }

      it('should create empty bookmarks', () => {

        return pactum
            .spec()
            .post('/bookmarks')
            .withHeaders({
              'Authorization' : 'Bearer $S{userAt}'
            })
            .withBody(dto)
            .expectStatus(201)
            .stores('bookmarkId','id');
      })
    })

    describe('Get Bookmarks', () => {
      it('should get bookmarks', () => {

        return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({
              'Authorization' : 'Bearer $S{userAt}'
            })
            .expectStatus(200)
            .expectJsonLength(1);

      })
    })

    describe('Get Bookmark by id', () => {
      it('should get bookmark by id', () => {

        return pactum
            .spec()
            .get('/bookmarks/{id}')
            .withPathParams('id','$S{bookmarkId}')
            .withHeaders({
              'Authorization' : 'Bearer $S{userAt}'
            })
            .expectStatus(200)
            .expectBodyContains('$S{bookmarkId}');

      })
    })

    describe('Edit Bookmark by id', () => {

      const dto: EditBookmarkDto = {
        title: "Recommended course",
        description: 'Free yt course edited description',
        link: "https://www.youtube.com/watch?v=GHTA143_b-s"
      }

      it('should edit bookmark by id', () => {

        return pactum
            .spec()
            .patch('/bookmarks/{id}')
            .withPathParams('id','$S{bookmarkId}')
            .withHeaders({
              'Authorization' : 'Bearer $S{userAt}'
            })
            .withBody(dto)
            .expectStatus(200)
            .expectBodyContains('$S{bookmarkId}');
      })
    })

    describe('Delete Bookmark by id', () => {

      it('should edit bookmark by id', () => {

        return pactum
            .spec()
            .delete('/bookmarks/{id}')
            .withPathParams('id','$S{bookmarkId}')
            .withHeaders({
              'Authorization' : 'Bearer $S{userAt}'
            })
            .expectStatus(204)
      })
    })

  })
});