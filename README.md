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
PORT=xxxx
```

## Database
Install PostgreSQL
```sql
CREATE TABLE public.users (
	user_id int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	email varchar NOT NULL,
	"password" varchar NOT NULL,
	CONSTRAINT user_pk PRIMARY KEY (user_id)
);

CREATE TABLE public.refresh_tokens (
	"token" varchar NOT NULL,
	user_id int4 NOT NULL,
	CONSTRAINT refresh_tokens_pk PRIMARY KEY (token)
);


ALTER TABLE public.refresh_tokens ADD CONSTRAINT refresh_tokens_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;
```
