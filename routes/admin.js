import { Router } from 'express';
import { body } from 'express-validator';
import adminController from '../controllers/admin.js';
import authMiddleware from '../middlewares/is-auth.js';
const router = Router();

router.get(
  '/add-product',
  authMiddleware.isAuthenticated,
  adminController.getAddProduct
);

router.post(
  '/add-product',
  [
    body('title', 'Title has to be string of min. 3 characters')
      .isLength({ min: 3 })
      .isString()
      .trim(),
    // body('imageUrl', 'Invalid URL').isURL(),
    body('price', 'Invalid price, format should be float').isFloat(),
    body(
      'description',
      'Description should be minimum 3 characters (up to 200!)'
    )
      .isLength({ min: 3, max: 200 })
      .trim(),
    body('image').custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Attached file is not an image.');
      }
      return true;
    }),
  ],
  authMiddleware.isAuthenticated,
  adminController.postAddProduct
);

router.get(
  '/products',
  authMiddleware.isAuthenticated,
  adminController.getProducts
);

router.get(
  '/edit-product/:productId',
  authMiddleware.isAuthenticated,
  adminController.getEditProduct
);

router.post(
  '/edit-product',
  [
    body('title', 'Title has to be string of min. 3 characters')
      .isLength({ min: 3 })
      .isString()
      .trim(),
    // body('imageUrl', 'Invalid URL').isURL(),
    body('price', 'Invalid price, format should be float').isFloat(),
    body(
      'description',
      'Desscription should be minimum 3 characters (up to 200!)'
    )
      .isLength({ min: 3, max: 200 })
      .trim(),
  ],
  authMiddleware.isAuthenticated,
  adminController.postEditProduct
);

// router.post(
//   '/delete-product',
//   authMiddleware.isAuthenticated,
//   adminController.postDeleteProduct
// );

router.delete(
  '/product/:productId',
  authMiddleware.isAuthenticated,
  adminController.deleteProduct
);

export default {
  routes: router,
};
