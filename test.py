import paho.mqtt.client as mqtt

# MQTT Broker ayarları
broker = "broker.hivemq.com"
topic = "esp32/sensors"

# Mesaj geldiğinde çalışan fonksiyon
def on_message(client, userdata, msg):
    print(f"Topic: {msg.topic}")
    print(f"Message: {msg.payload.decode()}")

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Broker'a bağlandı.")
        client.subscribe(topic)
        print(f"'{topic}' topic'i dinleniyor...")
    else:
        print("Bağlantı hatası, kod:", rc)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

print("Broker'a bağlanılıyor...")
client.connect(broker, 1883, 60)

# Sürekli mesajları dinle
client.loop_forever()
