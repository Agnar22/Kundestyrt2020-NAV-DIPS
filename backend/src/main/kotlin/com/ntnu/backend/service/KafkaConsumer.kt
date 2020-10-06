package com.ntnu.backend.service

import org.apache.kafka.clients.consumer.KafkaConsumer
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass
import org.springframework.stereotype.Component
import kotlin.concurrent.thread

@Component
@ConditionalOnMissingClass(value = ["com.ntnu.backend.IntegrationTests"])
class KafkaConsumerClass {

    @Autowired
    fun consume(kafkaConsumer: KafkaConsumer<String, String>) {
        thread(start = true) {
            while (true) {
                val records = kafkaConsumer.poll(1000)
                for (record in records) {
                    println(record)
                }
            }
        }
    }
}

