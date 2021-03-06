
# Kundestyrt2020-NAV-DIPS


## Contents of this file
 * [Introduction](#introduction)
 * [Installation](#installation)
 * [SMART on FHIR](#smart-on-fhir)
 * [Information flow](#information-flow)
 * [Usage](#usage)
 * [Code style](#code-style)
 
## Introduction
This project is the work of group 9 in the class TDT4290 - Customer Driven Project at NTNU during the fall of 2020. The group was assigned [NAV](https://github.com/navikt) and [DIPS](https://github.com/DIPSAS) as customers, who wanted to explore the possibilities and capabilities available through the use of the [SMART on FHIR](https://docs.smarthealthit.org) platform in developing a web-app.
The main goal of this project was to create a SMART-app, as a proof of concept for digitalizing the process of sending a specific type of medical certificate (attendance allowance), from a doctor using an EHR platform, to NAV's systems.

## Project Structure
The frontend folder contains source code for the client application. React is used to build the view, and implements the [SMART JS Client Library](http://docs.smarthealthit.org/client-js/) for SMART functionality: mainly authentication and FHIR resource access. 

The backend folder contains the source code for a backend service using [Apache Kafka](https://kafka.apache.org). The backend also accesses the FHIR API to gather updated data about medical certificates, and sends this to a Kafka Topic.

All files and their function:

![Developmentview](documentation/development_view.png)

## Installation

Following is a guide on how to setup the project. The frontend and the backend can run independently of each other. The frontend is only relying on the backend when it is to send the form, as displayed in [the information flow](#information-flow).

### Frontend
Download  and install **Node.js** and **npm** following [this installation guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Navigate to the `\frontend` folder, and install all necessary dependencies using the terminal with:
```bash
npm install
```
When all dependencies are installed the app can be started by running
 ```bash
npm start
```
### Back-end
The backendapplication has a Kafka producer & -consumer. It connects to bootstrap-servers, as specified in application.properties.
To allow the Kafka producer & -consumer to connect to NAV's Kafka, we need to have a keystore and a truststore, as well as the respective passwords. If you do not have this, the backend will not run. However, it is possible to [run Kafka locally](#run-kafka-locally).
 - Ask the owner of this repository to send the keystore and clientstore, as well as the respective passwords.
 - From there on, there are two recommended ways to run the backend, from the command line or from Intellij.
   - <b>Intellij:</b>
        - [Download Intellij.](https://www.jetbrains.com/idea/download/)
        - Open the project in Intellij with the backend folder as root folder.
        - Set the necessary environment variables for the keystore and truststore by:
            - double tap shift -> "Edit configurations..." -> "+" -> "Spring boot"
                - Set "Main class" to: com.ntnu.backend.BackendApplication
                - Set "Environment variables" to:
                ```text
                CLIENT_KEYSTORE_LOCATION=<KEYSTORE_LOCATION>;CLIENT_KEYSTORE_PASSWORD=<KEYSTORE_PASSWORD>;CLIENT_TRUSTSTORE_LOCATION=<TRUSTSTORE_LOCATION>;CLIENT_TRUSTSTORE_PASSWORD=<TRUSTSTORE_PASSWORD>
                ```
            - Accept changes by clicking "OK"
        - Set SDK to a JDK with Java version 11.0.9 by:
            - "File" -> "Project structure..." -> "Project" -> click the drop down menu under "Project SDK"
               - Select an option with "java version 11.0.9"
               - If you can't find that option, you will have to [download the correct SDK](https://www.jetbrains.com/help/idea/sdk.html#change-project-sdk)
            - Click "Apply"
            - Click "OK"
            - Restart Intellij
        - Install dependencies: Right click on pom.xml -> "Maven" -> "Reload Project"
        - Run the application by pressing the green play button (Shift+F10).
    - <b>Command line:</b>
        - [Install Maven.](https://www.baeldung.com/install-maven-on-windows-linux-mac)
        - Navigate to the `\backend` folder
        - Run the application with:
       ```bash
       sudo mvn spring-boot:run -Dspring-boot.run.arguments="--CLIENT_KEYSTORE_LOCATION=<KEYSTORE_LOCATION> --CLIENT_KEYSTORE_PASSWORD=<KEYSTORE_PASSWORD> --CLIENT_TRUSTSTORE_LOCATION=<TRUSTSTORE_LOCATION> --CLIENT_TRUSTSTORE_PASSWORD=<TRUSTSTORE_PASSWORD>"
       ```
 - You can test that everything is working by using the [testing endpoint](http://localhost:8081/testing). It should display "Published successfully".
 
### Run Kafka locally
If you want to run Kafka locally, follow one of these guides:
 - Windows: [Video by Daily Code Buffer](https://www.youtube.com/watch?v=EUzH9khPYgs)
 - Ubuntu 18.04: [Tutorial by DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-apache-kafka-on-ubuntu-18-04)

Then you will have to [remove these lines](https://github.com/Agnar22/Kundestyrt2020-NAV-DIPS/blob/master/backend/src/main/kotlin/com/ntnu/backend/config/Kafka.kt#L38-L42) and set the correct [bootstrap-server](https://github.com/Agnar22/Kundestyrt2020-NAV-DIPS/blob/master/backend/src/main/resources/application.properties#L6).

## SMART on FHIR
The SMART on FHIR client library allows you to build browser based apps - hereafter referred to as SMART apps - that can interact with FHIR REST APIs. 

### Authorization
A SMART app must support the [EHR launch flow](http://www.hl7.org/fhir/smart-app-launch/#ehr-launch-sequence). When opening the SMART app from within the EHR client the authorization process is started. In the authorization method the scope for the client is defined, specifying the access rights for the client. The authorization process is done in [launcher.js](https://github.com/Agnar22/Kundestyrt2020-NAV-DIPS/blob/29cff4bfed12dbadd79b6e60c65595e4f72405b7/frontend/src/components/Launcher.js#L12-L22). When the FHIR authorization server has authorized the EHR client we are redirected to the application. In the context from the response from the FHIR authorization server there is a client-instance of class [Client](http://docs.smarthealthit.org/client-js/typedoc/classes/_client_.client.html) defined in the SMART on FHIR framework. The client-instance - hereafter referred to as SMART client - can be used to interact with the FHIR API.

### Using the SMART client

#### Reading patient information
The SMART app is associated with a patient. Information about the current patient can be read using the method `client.patient.read()`. The method returns a _Promise_ containing the patient resource as specified in the [FHIR documentation](https://www.hl7.org/fhir/patient.html).

#### Writing to the EHR
To write a new or update an existing _QuestionnaireResponse_ we use the `request()` method from the SMART client. The method takes _RequestOptions_ as argument. _RequestOptions_ is an object that should at least contain the following for creating a new _QuestionnaireResponse_: 
```
{ 
    url: [fhir-base-url]/QuestionnaireResponse,
    body: {QuestionnaireResponse},
    headers: RequestHeaders,
    method: 'POST'
}
```
To update an existing _QuestionnaireResponse_ the _RequestOptions_ should contain the following:
```
{ 
    url: [fhir-base-url]/QuestionnaireResponse/[resource-id],
    body: {QuestionnaireResponse},
    headers: {RequestHeaders},
    method: 'PUT'
}
```
In both cases the request body is a string containing the _QuestionnaireResponse_ in JSON format. A template for a _QuestionnaireResponse_ can be found in [this file](https://github.com/Agnar22/Kundestyrt2020-NAV-DIPS/blob/master/frontend/src/QuestionnaireResponseTemplate.json). _RequestHeaders_ should be a JSON containing at least the following:
```
{ 
    'content-type': 'application/fhir+json',
    Accept: 'application/fhir+json'
}
```
A _QuestionnaireResponse_ that is saved without being completed will have `status: "in-progress"` whereas a _QuestionnaireResponse_ that is sent to NAV will have `status: "completed"`.


## Information flow
The general flow of information after the SMART client has been authorized is depicted in the sequence diagram below. 

![](documentation/Sequence_diagram.png)

When a doctor opens a document, a request is sent to the FHIR API for patient information and existing _QuestionnaireResponse_. If an in-progress _QuestionnaireResponse_ exists the fields in the applicaton is prefilled with this information. Else only the patient ssn and name is prefilled. 

When a doctor saves or sends the form a _QuestionnaireResponse_ is created or updated in the FHIR server. When sending the form a request is also sent to the backend at NAV. This request contains the SMART client access token and the identifier to the _QuestionnaireResponse_. The backend then uses the access token together with the identifier to get the _QuestionnaireResponse_ from the FHIR API. The _QuestionnaireResponse_ is then published on the Kafka topic in the NAV cluster. 

## Usage
### Questionnaire
Before using the application a _Questionnaire_ has to be pushed to the FHIR server. When using the servers supplied by SMART Health IT this has to be done every day. The _Questionnaire_ can be pushed to the FHIR server with a POST request with the following body:

```
{
  "version": "0.1",
  "subjectType": [
    "Navn",
    "Personnummer",
    "Dato fra",
    "Dato til",
    "Notat"
  ],
  "status": "active",
  "experimental": true,
  "effectivePeriod": {
    "start": "2020-10-12T22:00:00.000Z"
  },
  "name": "pleiepenger",
  "title": "Pleiepenger",
  "resourceType": "Questionnaire",
  "item": [
    {
      "type": "string",
      "required": true,
      "linkId": "spm_navn",
      "text": "Navn"
    },
    {
      "type": "string",
      "required": true,
      "linkId": "spm_personnummer",
      "text": "Personnummer"
    },
    {
      "type": "string",
      "required": false,
      "linkId": "spm_dato_fra",
      "text": "Dato fra"
    },
    {
      "type": "string",
      "required": false,
      "linkId": "spm_dato_til",
      "text": "Dato til"
    },
    {
      "type": "string",
      "required": false,
      "linkId": "spm_notater",
      "text": "Notater"
    }
  ]
}
```

As the FHIR API provided by smarthealtit.org deletes new addition on a daily basis, the id of the newly inserted *Questionnaire*  must be updated in the front-end code. The new value for the *Questionnaire id* should replace the value in the following two places:
- [QuestionnaireResponseTemplate.json](https://github.com/Agnar22/Kundestyrt2020-NAV-DIPS/blob/29cff4bfed12dbadd79b6e60c65595e4f72405b7/frontend/src/QuestionnaireResponseTemplate.json#L3)
- [Patient.js](https://github.com/Agnar22/Kundestyrt2020-NAV-DIPS/blob/29cff4bfed12dbadd79b6e60c65595e4f72405b7/frontend/src/components/Patient.js#L21)

### Run the project without docker


From the frontend folder, start the app in development mode:
`npm start` 

The back-end must then be started by running _KafkaController.kt_ from the _bakend_ directory. 

With the back-end running, the app can be launched through the SMART app launcher provided by [smarthealtit.org](https://launch.smarthealthit.org/).
Select **Provider EHR Launch** and **R3 (STU3)** as FHIR version. Then you can select an arbitrary *Patient* and *Provider* in the drop-down menus.

The **App Launch URL** should then be set to match the url of the app, http://localhost:3030.
By clicking "Launch App!" the app will then be launched from the simulated EHR. 

When the app has loaded it is possible to add a note in the text field, as well as selecting a period through the date-pickers. The form can be saved (to the FHIR-API) by using the "Lagre"-button.
The information will then be available again when launching the app with the same patient at a later time.
It is also possible to click send, which will send a request to the back-end, and in turn publish the form on the Kafka topic.
A confirmation will pop-up when any of these two actions are successful.

 
### Build and run project with Docker
Download and install Docker as explained in [this guide](https://docs.docker.com/desktop/).

From frontend folder:

`docker build -t frontend:dev .`

Run image as container:

`docker run -it -v ${PWD}:/app -v /app/node_modules -p 3001:3000 -e CHOKIDAR_USEPOLLING=true frontend:dev`

The application is now available from the docker default ip on port 3001.

**NOTE:** When the frontend is run as a container launch.smarthealthit.org will reject it as it does not use https. This could be avioded by setting up certificates for https. 
 
## Code style
The frontend uses the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) for React.
If you want to run linter for the project:
```bash
npm run lint
```

Automatically fix small mistakes:
```bash
npm run lint-fix
```
