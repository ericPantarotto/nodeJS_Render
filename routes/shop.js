import express from 'express';
import shopController from '../controllers/shop.js';
import authMiddleware from '../middlewares/is-auth.js';

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', authMiddleware.isAuthenticated, shopController.getCart);
router.post('/cart', authMiddleware.isAuthenticated, shopController.postCart);
router.post(
  '/cart-delete-item',
  authMiddleware.isAuthenticated,
  shopController.postCartDeleteProduct
);

router.get('/orders', authMiddleware.isAuthenticated, shopController.getOrders);
// router.post(
//   '/create-order',
//   authMiddleware.isAuthenticated,
//   shopController.postOrder
// );

router.get('/orders/:orderId', authMiddleware.isAuthenticated, shopController.getInvoice); 

router.get('/checkout', shopController.getCheckout);
router.get('/checkout/success', shopController.getCheckoutSuccess); 
router.get('/checkout/cancel', shopController.getCheckout);

export const expRouter = router;
