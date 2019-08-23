import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import users from '../database/seed-data/users';

chai.use(chaiHttp);

let userToken;
let otherToken;

describe('Follow/Unfollow Test Feature', () => {
  const payload1 = {
    user: {
      username: users[8].username,
      password: users[2].password2
    }
  };
  const payload2 = {
    user: {
      username: users[12].username,
      password: users[2].password2
    }
  };
  before((done) => {
    chai.request(app)
      .post('/api/users/login')
      .send(payload1)
      .end((err, res) => {
        userToken = res.body.user.token;
        if (err) return done(err);
        done();
      });
  });
  before((done) => {
    chai.request(app)
      .post('/api/users/login')
      .send(payload2)
      .end((err, res) => {
        otherToken = res.body.user.token;
        if (err) return done(err);
        done();
      });
  });
  it('Should enable User to follow an author', (done) => {
    chai.request(app)
      .post('/api/profiles/joeeasy/follow')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('You are now following joeeasy');
        if (err) return done(err);
        done();
      });
  });
  it('Should not allow User to follow an author twice', (done) => {
    chai.request(app)
      .post('/api/profiles/joeeasy/follow')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(409);
        expect(res.body.message).to.equal('You are already following joeeasy');
        if (err) return done(err);
        done();
      });
  });
  it('Should not allow User to follow himself', (done) => {
    chai.request(app)
      .post('/api/profiles/adeola/follow')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(409);
        expect(res.body.message).to.equal('You cannot follow yourself');
        if (err) return done(err);
        done();
      });
  });
  it('Should return error when User is not found.', (done) => {
    chai.request(app)
      .post('/api/profiles/mackuval/follow')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal('User not found');
        if (err) return done(err);
        done();
      });
  });
  it('Should return an array of Authors User is Following', (done) => {
    chai.request(app)
      .get('/api/profiles/joeeasy/following')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        expect(res.body.authorsIFollow).to.be.an('array');
        if (err) return done(err);
        done();
      });
  });
  it('Should return an empty array when user is not following any Author yet', (done) => {
    chai.request(app)
      .get('/api/profiles/joeeasy/following')
      .set('authorization', otherToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('You are yet to follow an Author.');
        if (err) return done(err);
        done();
      });
  });
  it('Should return an error if Author does not exist', (done) => {
    chai.request(app)
      .get('/api/profiles/jack/following')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal('User not found.');
        if (err) return done(err);
        done();
      });
  });
  it('Should return an array of User Followers', (done) => {
    chai.request(app)
      .get('/api/profiles/joeeasy/followers')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('You are yet to have followers.');
        if (err) return done(err);
        done();
      });
  });
  it('Should return an empty array if Author does not have a follower.', (done) => {
    chai.request(app)
      .get('/api/profiles/faksam/followers')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('You are yet to have followers.');
        if (err) return done(err);
        done();
      });
  });
  it('Should return an error if Author does not exist.', (done) => {
    chai.request(app)
      .get('/api/profiles/tommy/followers')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal('User not found.');
        if (err) return done(err);
        done();
      });
  });
  it('Should enable a User to unfollow an Author', (done) => {
    chai.request(app)
      .delete('/api/profiles/joeeasy/unfollow')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('You have Unfollowed joeeasy');
        if (err) return done(err);
        done();
      });
  });
  it('Should return a error when a User never followed an Author', (done) => {
    chai.request(app)
      .delete('/api/profiles/ugochukwu/unfollow')
      .set('authorization', userToken)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal('You never followed ugochukwu');
        if (err) return done(err);
        done();
      });
  });
  it('Should return error if User token is invalid', (done) => {
    chai.request(app)
      .post('/api/profiles/ugochukwu/follow')
      .set('authorization', 'mjr456nb321miojl')
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal('You do not have permission to this page.');
        if (err) return done(err);
        done();
      });
  });
});
