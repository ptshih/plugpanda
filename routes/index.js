const Muni = require('muni');

const router = new Muni.Router({
  version: 'v2',
  controllers: {
  },
});

// Alias all PATCH to PUT
router.patch('*', (req, res, next) => {
  req.method = 'PUT';
  return next();
});

// Add controller routes
router.addControllerRoutes();

// Export the router
module.exports = router;
