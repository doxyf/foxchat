CREATE TABLE people (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	username VARCHAR(30) UNIQUE NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL,
	token VARCHAR(100) UNIQUE NOT NULL,
	passwd TEXT NOT NULL,
	salt TEXT NOT NULL
);