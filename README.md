# JWT-Auth-boilerplate

## ENV 
ACCESS_TOKEN_SECRET= require('crypto').randomBytes(64).toString('hex')
REFRESH_TOKEN_SECRET= require('crypto').randomBytes(64).toString('hex')
ACCESS_TOKEN_EXP=5m
REFRESH_TOKEN_EXP=60m
NODE_ENV=dev || production