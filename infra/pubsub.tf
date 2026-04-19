resource "google_pubsub_topic" "iot_telemetry" {
  name = "venue-iot-telemetry"
  
  labels = {
    environment = "production"
    service     = "iot-ingestion"
  }
}

resource "google_pubsub_subscription" "aggregator_sub" {
  name  = "iot-aggregator-subscription"
  topic = google_pubsub_topic.iot_telemetry.name

  # Enable dead letter policy for robustness
  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.iot_telemetry_dead_letter.id
    max_delivery_attempts = 5
  }

  ack_deadline_seconds = 60
}

resource "google_pubsub_topic" "iot_telemetry_dead_letter" {
  name = "venue-iot-telemetry-dead-letter"
}
