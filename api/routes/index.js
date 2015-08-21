const Muni = require('muni');
const db = require('../config/db');

// Controllers
const CarController = require('../controllers/car');
const ChargepointController = require('../controllers/chargepoint');
const TwilioController = require('../controllers/twilio');

// Create the router
const router = new Muni.Router({
  version: 'api',
  controllers: {
    car: new CarController({
      db: db,
    }),
    chargepoint: new ChargepointController({
      db: db,
    }),
    twilio: new TwilioController({
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
