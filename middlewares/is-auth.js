function isAuthenticated(req, res, next) {
  if (!req.session.isLoggedIn) return res.status(401).redirect('/login');
  next();
}

export default {
  isAuthenticated,
};
