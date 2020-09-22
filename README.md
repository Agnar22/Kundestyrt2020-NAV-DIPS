# Kundestyrt2020-NAV-DIPS

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
