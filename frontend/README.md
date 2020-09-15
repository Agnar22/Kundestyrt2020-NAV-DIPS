# Getting started

## Run the project locally

Install all necessary dependencies:
### `npm install`

Start the app in development mode:
### `npm start`

## Build and run project with docker

From frontend folder:

`docker build -t frontend:dev .`

Run image as container:

`docker run -it -v ${PWD}:/app -v /app/node_modules -p 3001:3000 -e CHOKIDAR_USEPOLLING=true frontend:dev`

The application is now available from the docker default ip on port 3001.
