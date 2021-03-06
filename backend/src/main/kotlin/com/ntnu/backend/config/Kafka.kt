package com.ntnu.backend.config

import org.apache.kafka.clients.admin.NewTopic
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.kafka.common.serialization.StringSerializer
import org.springframework.boot.autoconfigure.kafka.KafkaProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.config.TopicBuilder
import org.springframework.kafka.core.DefaultKafkaProducerFactory
import org.springframework.kafka.core.KafkaAdmin
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.kafka.core.ProducerFactory

/**
 * This class contains all the necessary beans for kafka.
 *
 * createTopic creates a new topic on start up if it does not exist.
 * consumer creates a bean for a kafka consumer.
 * kafkaTemplate creates a bean for a kafka producer.
 */

@Configuration
class Kafka(properties: KafkaProperties) {

    private val topic: String = properties.template.defaultTopic
    private val hosts: MutableList<String> = properties.bootstrapServers
    private val trustStoreLocation: String = properties.ssl.trustStoreLocation.filename!!
    private val trustStorePassword: String = properties.ssl.trustStorePassword
    private val keyStoreLocation: String = properties.ssl.keyStoreLocation.filename!!
    private val keyStorePassword: String = properties.ssl.keyStorePassword
    private val kafkaConfig : HashMap<String, Any> = hashMapOf(
            "bootstrap.servers" to hosts,
            "group.id" to "test_group",
            "security.protocol" to "SSL",
            "enable.auto.commit" to "true",
            "ssl.truststore.location" to trustStoreLocation,
            "ssl.truststore.password" to trustStorePassword,
            "ssl.keystore.type" to "PKCS12",
            "ssl.keystore.location" to keyStoreLocation,
            "ssl.keystore.password" to keyStorePassword,
            "key.serializer" to StringSerializer::class.java,
            "key.deserializer" to StringDeserializer::class.java,
            "value.serializer" to StringSerializer::class.java,
            "value.deserializer" to StringDeserializer::class.java
    )

    @Bean
    fun admin(): KafkaAdmin {
        return KafkaAdmin(kafkaConfig)
    }

    @Bean
    fun createTopic(): NewTopic {
        return TopicBuilder.name(topic).build()
    }

    @Bean
    fun producerFactory(): ProducerFactory<String, String> {
        return DefaultKafkaProducerFactory(kafkaConfig)
    }

    @Bean
    fun consumer(): KafkaConsumer<String, String> {
        val kafkaConsumer = KafkaConsumer<String, String>(kafkaConfig)
        kafkaConsumer.subscribe(listOf(topic))
        return kafkaConsumer
    }

    @Bean
    fun kafkaTemplate(): KafkaTemplate<String, String> {
        return KafkaTemplate(producerFactory())
    }
}