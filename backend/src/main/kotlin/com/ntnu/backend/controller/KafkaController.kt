package com.ntnu.backend.controller

import org.json.JSONObject
import org.springframework.boot.autoconfigure.kafka.KafkaProperties
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.web.bind.annotation.*

/**
 * This class contains the endpoints for the application.
 *
 * sendApplication receives a JWT as well as a questionnaire response id.
 * It then queries the FHIR server for the requested questionnaire response id.
 * This ensures that authentication and authorization is centralized at the FHIR server.
 *
 * publishMessage is a dummy endpoint. It does nothing more than putting "testmessage"
 * on the topic specified in application.properties file.
 */
@RestController
class KafkaController(val kafkaTemplate: KafkaTemplate<String, String>, properties: KafkaProperties) {

    val topic: String = properties.template.defaultTopic

    @GetMapping("/testing")
    @ResponseStatus(HttpStatus.OK)
    fun publishMessage(): String {
        kafkaTemplate.send(topic, "testmessage");
        return "Published successfully";
    }

    @CrossOrigin
    @PostMapping("/send-application")
    @ResponseStatus(HttpStatus.CREATED)
    fun sendApplication(@RequestHeader(name="Authorization") token: String, @RequestBody body: String): ResponseEntity<String> {
        // The frontend sometimes sends the body with a '='-suffix, this has to be removed.
        // The line below is a temporary fix for this problem.
        val questionnaireResponseId = if (body.takeLast(1) == "=") body.dropLast((1)) else body
        val response = khttp.get(
            url= "http://launch.smarthealthit.org/v/r3/fhir/QuestionnaireResponse/${questionnaireResponseId}",
            headers = mapOf(
                    "Authorization" to token,
                    "Content-Type" to "application/fhir-json"
            )
        )
        return when (response.statusCode) {
            200 -> {
                kafkaTemplate.send(topic, response.text)
                ResponseEntity.ok("Published application!")
            }
            else -> {
                ResponseEntity.badRequest().body(
                        "{\"FhirResponseCode\":${response.statusCode}, \"FhirResponseError\":\"${response.text}\"}"
                )
            }
        }
    }
}