import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import users from '../database/seed-data/users';
import db from '../database/models';

chai.use(chaiHttp);
let hash1;
let hash2;
let passwordHash;

const { User } = db;
describe('User SignUp', () => {
  before((done) => {
    chai.request(app)
      .post('/api/users')
      .send({
        user: users[10]
      })
      .end((err) => {
        if (err) return done(err);
        User.findOne({
          where: {
            email: users[10].email
          }
        }).then((user) => {
          hash1 = user.dataValues.hash;
          done();
        }).catch(err => done(err));
      });
  });
  before((done) => {
    chai.request(app)
      .post('/api/users')
      .send({
        user: users[11]
      })
      .end((err) => {
        if (err) return done(err);
        User.findOne({
          where: {
            email: users[11].email
          }
        }).then((user) => {
          hash2 = user.dataValues.hash;
          done();
        }).catch(err => done(err));
      });
  });
  before((done) => {
    chai.request(app)
      .post('/api/users/reset-password')
      .send({
        user: {
          email: users[10].email,
        }
      })
      .end((err) => {
        if (err) return done(err);
        User.findOne({
          where: {
            email: users[10].email
          }
        }).then((user) => {
          passwordHash = user.dataValues.reset_password_hash;
          done();
        }).catch(err => done(err));
      });
  });
  describe('When passed valid data', () => {
    it('Should confirm a user email address', (done) => {
      chai.request(app)
        .get(`/api/confirmation/?emailToken=${hash1}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('Your account was successfully activated.');
          done();
        });
    });
    it('Should return an error if user link has expired', (done) => {
      const func = () => {
        chai.request(app)
          .get(`/api/confirmation/?emailToken=${hash2}`)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('The verification link has expired.');
          });
      };
      setTimeout(func, 1000000);
      done();
    });
    it('Should return an error if user has already been verified', (done) => {
      chai.request(app)
        .get(`/api/confirmation/?emailToken=${hash1}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('Your account has already been activated.');
          done();
        });
    });
    it('Should return an error message if user email is not found.', (done) => {
      chai.request(app)
        .post('/api/users/reverify')
        .send({
          user: {
            email: 'wrongemail@gmail.com'
          }
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('The email entered is not registered');
          done();
        });
    });
    it('Should return an error message if user email is not a valid email.', (done) => {
      chai.request(app)
        .post('/api/users/reverify')
        .send({
          user: {
            email: 'joetega.com'
          }
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(400);
          expect(res.body.errors.email[0]).to.equal('Please enter a valid email address.');
          done();
        });
    });
    it('Should return an error message if email field is empty', (done) => {
      chai.request(app)
        .post('/api/users/reverify')
        .send({
          user: {
            email: ''
          }
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(400);
          expect(res.body.errors.email[0]).to.equal('This email field is required.');
          done();
        });
    });
    it('Should send a re-verification email to User.', (done) => {
      chai.request(app)
        .post('/api/users/reverify')
        .send({
          user: {
            email: users[11].email
          }
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('A verification email has been sent to you.');
          done();
        });
    });
    it('It should send a reset password link to the user\'s email.', (done) => {
      chai.request(app)
        .post('/api/users/reset-password')
        .set('Content-Type', 'application/json')
        .send({
          user: {
            email: users[0].email,
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to
            .equal(`A reset password link has been sent to ${users[0].email}`);
          if (err) return done(err);
          done();
        });
    });
    it('It should send an error message to the user if user email is not found.', (done) => {
      chai.request(app)
        .post('/api/users/reset-password/')
        .set('Content-Type', 'application/json')
        .send({
          user: {
            email: 'bukkydada@gmail.com',
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('Email was not found');
          if (err) return done(err);
          done();
        });
    });
    it('It should update a user password', (done) => {
      chai.request(app)
        .post('/api/users/change-password/')
        .set('Content-Type', 'application/json')
        .send({
          user: {
            password: 'password1',
            password_confirmation: 'password1',
            passwordtoken: passwordHash
          }
        })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to
            .equal('Password successfully updated, you can now login with your new password');
          if (err) return done(err);
          done();
        });
    });
  });
});
