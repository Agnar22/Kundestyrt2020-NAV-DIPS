package com.ntnu.backend

import org.apache.kafka.clients.consumer.KafkaConsumer
import org.json.JSONObject
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.web.client.HttpStatusCodeException
import kotlin.concurrent.thread

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class IntegrationTests {

    @Autowired
    lateinit var restTemplate: TestRestTemplate

    var consumerReady: Boolean = false

    val consumedMessages: MutableList<String> = ArrayList()

    @Autowired
    fun consume(kafkaConsumer: KafkaConsumer<String, String>){
        thread(start = true) {
            consumerReady = true

            val timeNow = System.currentTimeMillis()
            while (true) {
                val records = kafkaConsumer.poll(500)
                for (record in records) {
                    if (record.timestamp() > timeNow) {
                        consumedMessages.add(record.value())
                    }
                }
            }
        }

        while(!consumerReady) {
            Thread.sleep(500)
        }
    }

    @Test
    fun `Assert that endpoint puts message on kafka`() {
        // Given
        val questResponseId = "SMART-PROMs-74-QR4"
        val headers = HttpHeaders()
        headers.set("Authorization", "")
        val entity: HttpEntity<String> = HttpEntity(questResponseId, headers)

        // When
        val result = restTemplate.exchange("/send-application", HttpMethod.POST, entity, String::class.java)
        Thread.sleep(10000)

        // Then
        Assertions.assertEquals(result.statusCode, HttpStatus.OK)
        Assertions.assertEquals(1, consumedMessages.count())
        val messageFromKafka = consumedMessages.elementAt(0)
        val receivedQuestResponseId = JSONObject(messageFromKafka).getString("id")
        Assertions.assertEquals( questResponseId, receivedQuestResponseId)
    }
}