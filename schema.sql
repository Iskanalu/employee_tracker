-- CREATE DATABASE company_db;
\c company_db;

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role_id INTEGER,
    manager_id INTEGER
);