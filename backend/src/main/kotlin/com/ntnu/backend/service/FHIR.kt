package com.ntnu.backend.service

import org.json.JSONArray
import org.json.JSONObject
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component
import java.time.Instant
import java.time.format.DateTimeFormatter
import kotlin.concurrent.thread


@Component
class FHIR(val kafkaTemplate: KafkaTemplate<String, String>) {

    @Value("\${spring.kafka.template.default-topic}")
    val topic : String = ""

    @Value("\${fhir.questionnaire}")
    val questionnaire : String = ""


    @Autowired
    fun listen_to_responses() {
        thread(start = true) {
            var lastUpdated : String = DateTimeFormatter.ISO_INSTANT.format(Instant.now())
            val sleepTime : Long = 500
            while (true) {
                val response = khttp.get("https://r3.smarthealthit.org/QuestionnaireResponse?questionnaire=${questionnaire}&authored=gt${lastUpdated}", headers = mapOf("Content-Type" to "application/fhir-json")).jsonObject

                // There are no new forms.
                if (!response.has("entry")) {
                    Thread.sleep(sleepTime)
                    continue
                }
                val forms = response.getJSONArray("entry")
                println("last updated ${lastUpdated}")
                forms.forEach{
                    val form : JSONArray = (it as JSONObject).getJSONObject("resource").getJSONArray("item")
                    kafkaTemplate.send(topic, form.toString())
                }
                Thread.sleep(sleepTime)
                lastUpdated = response.getJSONObject("meta").get("lastUpdated") as String
            }
        }
    }
}
