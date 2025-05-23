import network
import time

ssid = 'your_wifi_ssid'
password = 'your_wifi_password'

# Connect to Wi-Fi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)
while not wlan.isconnected():
    print("Connecting to Wi-Fi...")
    time.sleep(.2)

print("Connected to Wi-Fi:", wlan.ifconfig())