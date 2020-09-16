package com.ntnu.backend.controller

import org.springframework.http.HttpStatus
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController


@RestController
class KafkaController(val kafkaTemplate: KafkaTemplate<String, String>) {

    val TOPIC = "TestTopic";

    @GetMapping("/testing")
    @ResponseStatus(HttpStatus.OK)
    fun publishMessage(): String {
        kafkaTemplate.send(TOPIC, "testmessage");
        return "Published successfully";
    }
}