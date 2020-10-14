package com.ntnu.backend.service

import org.json.JSONArray
import org.json.JSONObject
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component
import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.StandardOpenOption
import kotlin.concurrent.thread


@Component
class FHIR(val kafkaTemplate: KafkaTemplate<String, String>) {

    @Value("\${spring.kafka.template.default-topic}")
    val topic : String = ""

    val questionnaire : String = "Questionnaire/235084"

    fun writeTimestamp(lastUpdated: String){
      Files.write(Paths.get("timestamps.txt"), (lastUpdated).toByteArray(), StandardOpenOption.WRITE)
    }

    fun readTimestamp(): String{
      return String(Files.readAllBytes(Paths.get("timestamps.txt")))
    }

    @Autowired
    fun listen_to_responses() {
        thread(start = true) {
            var lastUpdated : String = readTimestamp()
            val sleepTime : Long = 500
            while (true) {
                val response = khttp.get("https://r3.smarthealthit.org/QuestionnaireResponse?questionnaire=${questionnaire}&authored=gt${lastUpdated}", headers = mapOf("Content-Type" to "application/fhir-json")).jsonObject

                // There are no new forms.
                if (!response.has("entry")) {
                    Thread.sleep(sleepTime)
                    continue
                }
                val forms = response.getJSONArray("entry")

                forms.forEach{
                    val form : JSONArray = (it as JSONObject).getJSONObject("resource").getJSONArray("item")
                    kafkaTemplate.send(topic, form.toString())
                }

                lastUpdated = response.getJSONObject("meta").get("lastUpdated") as String
                writeTimestamp(lastUpdated)
                Thread.sleep(sleepTime)
            }
        }
    }
}
