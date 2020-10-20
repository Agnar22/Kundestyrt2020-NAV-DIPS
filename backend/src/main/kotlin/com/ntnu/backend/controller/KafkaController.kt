package com.ntnu.backend.controller

import org.springframework.boot.autoconfigure.kafka.KafkaProperties
import org.springframework.http.HttpStatus
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

    @PostMapping("/send-application")
    @ResponseStatus(HttpStatus.CREATED)
    fun sendApplication(@RequestHeader(name="Authorization") token: String, @RequestBody questionnaireResponseId: String): String {
        println("Used token ${token}.")
        val response = khttp.get("http://launch.smarthealthit.org/v/r3/fhir/QuestionnaireResponse/${questionnaireResponseId}", headers = mapOf("Authorization" to token, "Content-Type" to "application/fhir-json"))
        kafkaTemplate.send(topic, "Application with content: ${response.jsonObject}")
        return "Published application with content ${response.jsonObject}."
    }
}