package com.ntnu.backend

import com.ntnu.backend.service.KafkaConsumerClass
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.junit.Before
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import kotlin.concurrent.thread

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class IntegrationTests {

    @Autowired
    lateinit var restTemplate: TestRestTemplate

    var consumerReady: Boolean = false

    val consumedMessages: MutableList<String> = ArrayList()

    @Before
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
        val result = restTemplate.getForEntity("/testing", String::class.java)
        Assertions.assertEquals("Published successfully", result.body);
        Thread.sleep(10000)
        val message = consumedMessages.elementAt(0)
        Assertions.assertEquals(1, consumedMessages.count())
        Assertions.assertEquals( "testmessage", message)
    }
}