# Kundestyrt2020-NAV-DIPS

<<<<<<< HEAD
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
=======
# Backend
At the moment, the backend is limited to receiving a GET request on [localhost:8081/testing](http://localhost:8081/testing) and then putting a message ("testmessage") on a kafka topic ("TestTopic"). The KafkaAdmin and TopicBuilder in Kafka.kt is to ensure that the selected topics exists, otherwise it is created.

<b>Components</b>
 - [Enpoint](https://github.com/Agnar22/Kundestyrt2020-NAV-DIPS/blob/13_setup_kafka/backend/src/main/kotlin/com/ntnu/backend/controller/KafkaController.kt#L16-L21)
 - [Kafka config](https://github.com/Agnar22/Kundestyrt2020-NAV-DIPS/blob/13_setup_kafka/backend/src/main/kotlin/com/ntnu/backend/config/Kafka.kt)
 - [Kafka producer](https://github.com/Agnar22/Kundestyrt2020-NAV-DIPS/blob/13_setup_kafka/backend/src/main/kotlin/com/ntnu/backend/controller/KafkaController.kt#L19)
 
## Kafka
The backendapplication has a Kafkaproducer.
To run the backend, one has to setup Kafka, as we have not yet set up a remote server securely.
### Installation guides
 - Windows: [Video by Daily Code Buffer](https://www.youtube.com/watch?v=EUzH9khPYgs)
 - Ubuntu 18.04: [Tutorial by DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-apache-kafka-on-ubuntu-18-04) 
>>>>>>> 1b33b10d0326859717091a93f36bb5a7584c9ce1
