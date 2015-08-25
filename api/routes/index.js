const Muni = require('muni');
const db = require('../config/db');

// Controllers
const CarController = require('../controllers/car');
const SessionController = require('../controllers/session');
const StationController = require('../controllers/station');
const TwilioController = require('../controllers/twilio');

// Create the router
const router = new Muni.Router({
  version: 'api',
  controllers: {
    car: new CarController({
      db: db,
    }),
    session: new SessionController({
      db: db,
    }),
    station: new StationController({
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
