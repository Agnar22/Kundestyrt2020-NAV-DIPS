package com.ntnu.backend.config

import org.apache.kafka.common.serialization.StringSerializer
import org.springframework.boot.autoconfigure.kafka.KafkaProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.core.DefaultKafkaProducerFactory
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.kafka.core.ProducerFactory

@Configuration
class Kafka(properties: KafkaProperties) {

    private val topic: String = properties.template.defaultTopic
    private val hosts: MutableList<String> = properties.bootstrapServers
    private val kafkaConfig : HashMap<String, Any> = hashMapOf(
            "bootstrap.servers" to hosts,
            "security.protocol" to "SSL",
            "ssl.truststore.location" to "client.truststore.jks",
            "ssl.truststore.password" to "truststore_password",
            "ssl.keystore.type" to "PKCS12",
            "ssl.keystore.location" to "client.keystore.p12",
            "ssl.keystore.password" to "keystore_password",
            "key.serializer" to StringSerializer::class.java,
            "value.serializer" to StringSerializer::class.java
    )



    @Bean
    fun producerFactory(): ProducerFactory<String, String> {
        return DefaultKafkaProducerFactory(kafkaConfig)
    }

    @Bean
    fun kafkaTemplate(): KafkaTemplate<String, String> {
        return KafkaTemplate(producerFactory())
    }
}