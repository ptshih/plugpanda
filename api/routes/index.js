const Muni = require('muni');
const db = require('../config/db');

// Controllers
const DashboardController = require('../controllers/dashboard');
const UserController = require('../controllers/user');
const BmwController = require('../controllers/bmw');
const SessionController = require('../controllers/session');
const StationController = require('../controllers/station');
const TwilioController = require('../controllers/twilio');
const WorkerController = require('../controllers/worker');

// Create the router
const router = new Muni.Router({
  version: 'api',
  controllers: {
    dashboard: new DashboardController({
      db: db,
    }),
    user: new UserController({
      db: db,
    }),
    bmw: new BmwController({
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
    worker: new WorkerController({
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
