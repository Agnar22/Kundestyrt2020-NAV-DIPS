# Kundestyrt2020-NAV-DIPS

## Sandbox environment

### Setup

Clone the sandbox repository from smarthealthit.org:

`git clone https://github.com/smart-on-fhir/smart-dev-sandbox.git`

Change to the repository directory:

`cd smart-dev-sandbox`

Change `HOST` in `.env` to docker default ip address (192.168.99.100).

Start the docker containers: 

`docker-compose up`

Follow the [Getting Started Guide](./frontend/README.md) in the frontend-readme to buid and deploy the frontend application. 

### Use of the sandbox environment

While the sandbox environment is hosted in a local docker-container, go to <http://192.168.99.100:4013> 

Make sure that the FHIR api version is set to R3(STU3), enter the url for the frontend application in the url field (<http://192.168.99.100:3001>) and click launch. 