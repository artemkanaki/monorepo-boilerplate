# Monorepo Boilerplate

## Introduction

This is a boilerplate project for a monorepo implemented using native workspace tools from yarn.
Code is organized in a way that allows for easy sharing of code between different applications.
The server is implemented using Domain Driven Design principles and Hexagonal Architecture.
This way business logic becomes more expressive and easier to understand.
And infrastructure is clearly separated from business logic.

## How to run a server

```bash
# Install the dependencies
yarn;

# Copy the .env.example file to .env
cp apps/api/config/.env.example apps/api/config/.env;

# Start the API
yarn api start;
# Start the API in watch mode
yarn api start:watch;
```

## How to add migrations

```bash
# Create a new migration on Mac/Linux
yarn api migration:create <migartion-name>;

# Generate a new migration on Mac/Linux
yarn api migration:generate <migartion-name>;
```


