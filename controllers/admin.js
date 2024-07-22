import { validationResult } from 'express-validator';
import Product from '../models/product.js';
import fileHelper from '../util/file.js';

function getAddProduct(req, res, next) {
  // if (!req.session.isLoggedIn) return res.redirect('/login');
  return res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
  });
}

function postAddProduct(req, res, next) {
  const editMode = req.query.edit;
  const errors = validationResult(req);

  // if (!req.file) {
  //   console.log(errors.array());
  //   return res.status(422).render('admin/edit-product', {
  //     pageTitle: 'Add Product',
  //     path: '/admin/edit-product',
  //     editing: editMode,
  //     product: {
  //       title: req.body.title,
  //       price: req.body.price,
  //       description: req.body.description,
  //     },
  //     hasError: true,
  //     errorMessage: 'Attached file is not an image.',
  //     validationErrors: errors.array(),
  //   });
  // }

  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
      },
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const imageUrl = req.file.path;
  new Product({
    //HACK: to test 500 page
    // _id: ObjectId.createFromHexString('666417a11967e5424e491328'),
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    userId: req.session.user,
    imageUrl: imageUrl,
  })
    .save()
    .then(_ => {
      console.log('CREATED PRODUCT!');
      res.redirect('/admin/products');
    })
    // .catch(err => console.log(err));
    // .catch(_ => res.redirect('/500'));
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

function getEditProduct(req, res, next) {
  const editMode = req.query.edit;
  if (!editMode) return res.redirect('/');

  const prodId = req.params.productId;

  Product.findById(prodId)
    .then(product => {
      if (!product) return res.redirect('/');
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

function postEditProduct(req, res, next) {
  const prodId = req.body.productId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        _id: prodId,
      },
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString())
        return res.redirect('/');
      product.title = req.body.title;
      product.price = req.body.price;
      product.description = req.body.description;

      // req.file && (product.imageUrl = req.file.path);
      if (req.file) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = req.file.path;
      }

      return product.save().then(_ => {
        console.log('UPDATED PRODUCT !!!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

function deleteProduct(req, res, next) {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) return next(new Error('Product Not Found.'));
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id }); //NOTE: avoiding a race condition
    })
    .then(result => {
      if (result.deletedCount > 0) {
        console.log(result.deletedCount);
        console.log('DESTROYED PRODUCT in Products Collection!');
        Promise.resolve(req.user.removeFromCart(prodId)).then(_ => {
          console.log('DESTROYED PRODUCTin User Collection (cart.items)!');
        });
      }
      // return res.redirect('/admin/products');
      return res.status(200).json({message: 'Success!'});
    })
    .catch(_ => res.status(500).json({ message: 'Deleting product failed.' }));
  
  // .catch(err => {
  //   const error = new Error(err);
  //   error.httpStatusCode = 500;
  //   return next(error);
  // });
}

// function postDeleteProduct(req, res, next) {
//   const prodId = req.body.productId;
//   Product.findById(prodId)
//     .then(product => {
//       if (!product) return next(new Error('Product Not Found.'));
//       fileHelper.deleteFile(product.imageUrl);
//       return Product.deleteOne({ _id: prodId, userId: req.user._id }); //NOTE: avoiding a race condition
//     })
//     .then(result => {
//       if (result.deletedCount > 0) {
//         console.log(result.deletedCount);
//         console.log('DESTROYED PRODUCT in Products Collection!');
//         Promise.resolve(req.user.removeFromCart(prodId)).then(_ => {
//           console.log('DESTROYED PRODUCTin User Collection (cart.items)!');
//         });
//       }
//       return res.redirect('/admin/products');
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });

//   // // Product.findByIdAndDelete(prodId)
//   // Product.deleteOne({ _id: prodId, userId: req.user._id })
//   //   .then(result => {
//   //     if (result.deletedCount > 0) {
//   //       console.log(result.deletedCount);
//   //       console.log('DESTROYED PRODUCT in Products Collection!');
//   //       Promise.resolve(req.user.removeFromCart(prodId)).then(_ => {
//   //         console.log('DESTROYED PRODUCTin User Collection (cart.items)!');
//   //       });
//   //     }
//   //     return res.redirect('/admin/products');
//   //   })
//   //   .catch(err => {
//   //     const error = new Error(err);
//   //     error.httpStatusCode = 500;
//   //     return next(error);
//   //   });
// }

function getProducts(req, res, next) {
  // Product.find()
  Product.find({ userId: req.user._id })
    .then(products => {
      res.render('admin/products', {
        prods: products.map(obj => ({ ...obj._doc, editing: true })),
        pageTitle: 'My Shop',
        path: '/admin/products',
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

export default {
  getAddProduct,
  postAddProduct,
  getProducts,
  getEditProduct,
  postEditProduct,
  // postDeleteProduct,
  deleteProduct
};
