import express from 'express';
import { body, check } from 'express-validator';
import authController from '../controllers/auth.js';
import User from '../models/user.js';

const router = express.Router();

router.get('/login', authController.getLogin);
router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email address.'),
      // .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .custom(async (value, { req }) => {
        // if (value === 'test@test.com')
        //   throw new Error('This email address is forbidden.');
        // return true;
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject('Email exists already ...');
        }
      }),
      // .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      }),
  ],
  authController.postSignup
);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
export const expRouter = router;
