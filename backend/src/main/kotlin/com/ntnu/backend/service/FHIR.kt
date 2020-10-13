package com.ntnu.backend.service

import org.json.JSONArray
import org.json.JSONObject
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component
import kotlin.concurrent.thread


@Component
class FHIR(val kafkaTemplate: KafkaTemplate<String, String>) {

    @Value("\${spring.kafka.template.default-topic}")
    val topic : String = ""


    @Autowired
    fun listen_to_responses() {
        thread(start = true) {
            while (true) {
                val response = khttp.get("https://r3.smarthealthit.org/QuestionnaireResponse", headers = mapOf("Content-Type" to "application/fhir-json"))
                val forms = response.jsonObject.getJSONArray("entry")
                val lastUpdated = response.jsonObject.getJSONObject("meta").get("lastUpdated")
                println("last updated ${lastUpdated}")
                forms.forEach{
                    val form : JSONArray = (it as JSONObject).getJSONObject("resource").getJSONArray("item")
                    kafkaTemplate.send(topic, form.toString())
                }
                Thread.sleep(500000)
            }
        }
    }
}
