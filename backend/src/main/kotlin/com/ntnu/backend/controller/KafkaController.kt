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
    fun sendApplication(@RequestBody application: String): String {
        kafkaTemplate.send(topic, "Application with content: ${application}")
        return "Published application with content ${application}."
    }
}