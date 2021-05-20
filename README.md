# MQTT_car_detector
MQTT client that allow to collect the sensed data sent by an Arduino micro-controller and publish a summary of these data on a MQTT broker. These values represent the sound noise level sensed by a microphone sensor. The MQTT client publish the noise level corresponding to the average sensed sound noise level and maximum sound noise level recorded over the last 10 seconds with a frequency of sensing of 1 per second. The MQTT client should also publish the number of detected pulses (~ equivalent to the number of crossing vehicles). 

## Libraries:
- mosquitto on websockets
- paho mqtt for both of the web application and the python code
- pyserial to read data from the arduino
- chatjs for graph presentation

## environments:
- Arduino IDE
- Anaconda Spyder
- Notepad++

## topics:
noise : where data and max and avg are sent
noise/pulses: we use it to notify the client whether  a vehicule has passed
noise/events: we use it to notify the broker about the important event when the connection between
the client and the broker is broken(in are case the important data are: the connection attempts and the vehicules passed during this period

- the client is subscribed to noise/#

### NB: 
you will have to install websockets compatible mqtt, and update the port in the .conf
file if the port 1883 is already taken (or you can free the port 1833 from other apps and use it) 
and then run: mosquitto -c config.conf
here's the download link (1.5.4) : http://mirror.dkm.cz/eclipse/mosquitto/binary/win64/
