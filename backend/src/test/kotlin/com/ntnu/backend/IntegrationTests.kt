package com.ntnu.backend

import org.apache.kafka.clients.consumer.KafkaConsumer
import org.json.JSONObject
import org.junit.jupiter.api.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import kotlin.concurrent.thread

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class IntegrationTests {

    @Autowired
    lateinit var restTemplate: TestRestTemplate

    var consume: Boolean = true
    var consuming: Boolean = false
    var consumedMessages: MutableList<String> = ArrayList()


    @AfterEach
    fun tearDown(){
        // The consume function is autowired for each test.
        // We need to wait for the thread from the previous test to finish
        // before we can start the next one.
        consume=false
        while (consuming) {
            Thread.sleep(100)
        }
        consume=true
    }

    @Autowired
    fun consume(kafkaConsumer: KafkaConsumer<String, String>){
        thread(start = true) {
            consuming = true

            val timeNow = System.currentTimeMillis()
            while (consume) {
                val records = kafkaConsumer.poll(500)
                for (record in records) {
                    // Disregard any messages that was sent before the test
                    // in order to avoid dependencies in between runs.
                    if (record.timestamp() > timeNow) {
                        consumedMessages.add(record.value())
                    }
                }
            }
            consuming = false
        }

        while(!consuming) {
            Thread.sleep(500)
        }
    }

    @Test
    fun `Assert that endpoint puts message on kafka`() {
        // Given
        val questResponseId = "SMART-PROMs-74-QR4"
        val headers = HttpHeaders()
        // The FHIR server that we are using is accepting valid JWT tokens and no JWT tokens.
        // Only invalid tokens are denied access.
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

    @Test
    fun `Assert that invalid tokens are rejected`(){
        // Given
        val questResponseId = "SMART-PROMs-74-QR4"
        val headers = HttpHeaders()
        headers.set("Authorization", "Invalid token")
        val entity: HttpEntity<String> = HttpEntity(questResponseId, headers)

        // When
        val result = restTemplate.exchange("/send-application", HttpMethod.POST, entity, String::class.java)

        // Then
        Assertions.assertEquals(400, result.statusCodeValue)
    }
}