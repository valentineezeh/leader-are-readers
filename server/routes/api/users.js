import express from 'express';

import UserController from '../../controllers/UserController';
import AuthController from '../../controllers/AuthController';
import UserInputValidation from '../../middlewares/validations/AuthValidation';
import Authenticate from '../../middlewares/Authenticate';
import Users from '../../utils/utilities';
import UserValidation from '../../middlewares/validations/UserValidation';
import QueryValidation from '../../middlewares/validations/QueryValidation';
import EmailVerifyController from '../../controllers/EmailVerifyController';

const router = express.Router();

router.get('/', (req, res) => res.status(404).json({
  message: 'Welcome to Author Haven.'
}));

// Auth endpoints
router.post('/users', UserInputValidation.signUpInputValidation, AuthController.signUpUser);
router.post(
  '/users/reverify',
  UserInputValidation.emailInputValidation,
  EmailVerifyController.resendEmailVerification
);

router.post(
  '/users/reset-password',
  UserInputValidation.emailInputValidation,
  AuthController.resetPassword
);

router.post(
  '/users/change-password',
  UserInputValidation.passwordInputValidation,
  AuthController.updatePassword
);

router.get(
  '/confirmation',
  EmailVerifyController.emailVerification
);
router.post('/users/login', UserInputValidation.loginInputValidation, AuthController.signInUser);

// User profile endpoints
router.get('/profiles/:username', Users.findUserByUsername, UserController.getProfileByUsername);
router.put(
  '/profiles/:username',
  Authenticate.auth,
  Users.findUserByUsername,
  UserValidation.editUserProfile,
  UserController.editProfile
);
router.get(
  '/profiles',
  Authenticate.auth,
  QueryValidation.queryValidation,
  UserController.getAllUserProfile,
  UserController.editProfile
);
router.put(
  '/users/password',
  Authenticate.auth,
  UserInputValidation.passwordUpdateValidation,
  AuthController.changePassword
);
router.get('/featuredAuthor', UserController.getFeaturedAuthor);

export default router;
