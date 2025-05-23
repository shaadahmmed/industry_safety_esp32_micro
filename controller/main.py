import machine
import time
import urequests
import network

ssid = 'Baler Net'
password = 'NetValoNa69'

# Connect to Wi-Fi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)
while not wlan.isconnected():
    print("Connecting to Wi-Fi...")
    time.sleep(.2)

print("Connected to Wi-Fi:", wlan.ifconfig())

ir_pin = machine.Pin(25, machine.Pin.IN)

while True:
    ir_value = ir_pin.value()

    ir_data = {'sensorData': 1,'objectDetected': False}

    if ir_value == 0:
        print("IR signal detected")
        ir_data['sensorData'] = 0
        ir_data['objectDetected'] = True
    else:
        print("No IR signal detected")
        ir_data['sensorData'] = 1
        ir_data['objectDetected'] = False

    try:
        response = urequests.post("http://192.168.0.249:3000/api/irData", json=ir_data)
        print("Response:", response.text)
        response.close()
    except Exception as e:
        print("Error sending request:", e)

    time.sleep(1)