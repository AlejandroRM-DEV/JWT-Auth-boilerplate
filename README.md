# JWT-Auth-boilerplate

## ENV 
Create a .env file with the following:
```
ACCESS_TOKEN_SECRET= require('crypto').randomBytes(64).toString('hex')
REFRESH_TOKEN_SECRET= require('crypto').randomBytes(64).toString('hex')
ACCESS_TOKEN_EXP=5m
REFRESH_TOKEN_EXP=60m
NODE_ENV=dev || production
DB_URL=postgres://user:password@localhost:5432/databse
```

## Database
Install PostgreSQL

### sequelize-auto
Used to make models from existing database tables
```
npx sequelize-auto -o "./models" -d database -h localhost -u postgres -p 5432 -x IJCF.10 -e postgres
```