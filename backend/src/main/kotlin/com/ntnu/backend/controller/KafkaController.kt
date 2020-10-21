package com.ntnu.backend.controller

import org.json.JSONObject
import org.springframework.boot.autoconfigure.kafka.KafkaProperties
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.web.bind.annotation.*


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
        var b1 = body
        if (body.takeLast(1) == "=") {
            val b1 = body.dropLast(1)
        }
        val response = khttp.get("http://launch.smarthealthit.org/v/r3/fhir/QuestionnaireResponse/${b1}", headers = mapOf("Authorization" to token, "Content-Type" to "application/fhir-json"))
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