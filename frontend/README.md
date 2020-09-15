# Getting started

## Run the project locally

Install all necessary dependencies:
### `npm install`

Start the app in development mode:
### `npm start`

## Build and run project with docker

From frontend folder:
`<docker build -t frontend:dev .>`
`<docker run -it -v ${PWD}:/app \
    -v /app/node_modules \
    -p 3001:3000 \
    -e CHOKIDAR_USEPOLLING=true \
    sample:dev>`

