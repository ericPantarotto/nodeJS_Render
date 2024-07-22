function get404(req, res, next) {
  res
    .status(404)
    .render('404', {
      pageTitle: 'Page Not Found',
      path: '/404',
    });
}

function get500(req, res, next) {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
  });
}

export default { get404, get500 };

