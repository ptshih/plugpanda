# Configuration

## Environment Variables

If developing locally, create a `.env` file which is ignored by Git

```
NODE_ENV=development
HOST=http://localhost
...
```

**OR**

If on Heroku, include in the app's config variables

#### Required Variables

- NODE_ENV
	- Defaults to `development`
- HOST
	- Defaults to `http://localhost`
  - Self referencing public/external URL
  - Used by Iron workers
- PORT
	- Defaults to `9001`
- MONGODB_USER
- MONGODB_PASSWORD
- MONGODB_URL
	- Example: `localhost:12345/dbname`
- MONGO_SSL_CA
	- Single line version of `certificate.pem`
	- Easiest way is to replace all newlines with `\n`
	- The driver will convert `\n` into OS-specific newlines when connecting
- CLIENT_TOKEN
	- Used to generate User access tokens
	- This can be any randomized string
- WORKER_TOKEN
	- Used to authenticate Iron Worker API calls
	- This can be any randomized string
- COULOMB_SESS
	- Used to authenticate with the Chargepoint API
	- Need to get this from Chargepoint
- BMW_BASIC_AUTH
	- Used to authenticate with the BMW API
	- Need to get this from BMW
- TWILIO_ACCOUNT_SID
	- Used to authenticate with the Twilio API
- TWILIO_AUTH_TOKEN
	- Used to authenticate with the Twilio API
- IRON_PROJECT_ID
	- Used to authenticate Iron.io
- IRON_TOKEN
	- Used to authenticate Iron.io
- MAILGUN_KEY
	- Used to authenticate with Mailgun and send emails
