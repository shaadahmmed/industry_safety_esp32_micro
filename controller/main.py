from machine import Pin, ADC
import time
import urequests
from dht import DHT11
from math import log10

adc_pin = 34
load_resistor = 10000
adc_max = 4095
vin = 5
ro_clean_air = 10000
adc = ADC(Pin(adc_pin))
adc.atten(ADC.ATTN_11DB)
adc.width(ADC.WIDTH_12BIT)


ir_pin = Pin(25, Pin.IN)
dht_pin = 18
d= DHT11(Pin(dht_pin))


def read_voltage():
    adc_value = adc.read()
    voltage = adc_value * 3.3 / adc_max
    return voltage

def calculate_rs(voltage):
    if voltage == 0:
        return 1e9 
    return load_resistor * (vin - voltage) / voltage

def get_ppm(rs_ro_ratio):
    try: 
        ratio_log = log10(rs_ro_ratio)
        log_ppm = -0.48 * ratio_log + 0.78
        ppm = 10 ** log_ppm
        return ppm
    except:
        return -1  # error condition

def get_dht_data():
    d.measure()
    temperature = d.temperature()
    humidity = d.humidity()

    return temperature, humidity


while True:
    ir_value = ir_pin.value()

    voltage = read_voltage()
    rs = calculate_rs(voltage)
    rs_ro_ratio = rs / ro_clean_air
    ppm = get_ppm(rs_ro_ratio)

    temperature, humidity = get_dht_data()

    sensor_data ={
        "flameRead": ir_value,
        "tempRead": temperature,
        "humidity":humidity,
        "gasRead":ppm,
    }

    try:
        response = urequests.post("http://<backend_api:port>/api/irData", json=sensor_data)
        print("Response:", response.text)
        response.close()
    except Exception as e:
        print("Error sending request:", e)

    time.sleep(.5)