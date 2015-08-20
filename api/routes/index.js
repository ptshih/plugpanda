const Muni = require('muni');
const db = require('../config/db');

// Controllers
const ChargepointController = require('../controllers/chargepoint');

// Create the router
const router = new Muni.Router({
  version: 'api',
  controllers: {
    chargepoint: new ChargepointController({
      db: db,
    }),
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
