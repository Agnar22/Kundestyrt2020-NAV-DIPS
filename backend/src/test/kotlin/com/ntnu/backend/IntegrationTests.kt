package com.ntnu.backend

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class IntegrationTests {

    @Autowired
    lateinit var restTemplate: TestRestTemplate

    @Test
    fun `Assert that endpoint puts message on kafka`() {
        val result = restTemplate.getForEntity("/testing", String::class.java)
        Assertions.assertEquals("Published successfully", "Fail");
    }
}