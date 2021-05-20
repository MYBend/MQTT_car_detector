# -*- coding: utf-8 -*-
"""
Created on Wed Dec  2 18:50:45 2020

@author: Yasser
"""

import serial
from datetime import datetime
import paho.mqtt.client as mqtt
from time import sleep


connected = False
ser = serial.Serial("COM4",115200)

broker_address="localhost" 
port = 1883
client= mqtt.Client("client",transport='websockets')  #creating a new mqtt client instance
events = [] #a list that stores the events happened when the connection is lost

def on_disconnect(client, userdata, rc): #when a disconnection happens this is the code that going to execute
    if rc != 0: #whe check if the return code is eaquals to zero or not, zero means that the connection is fine that why we wrote !=
        connected = False #boolean variable the represents the connection satus, which we're going to use in while loop
        print("Unexpected MQTT disconnection. Will auto-reconnect")
        
        while not connected: #if we cant connect try again till the connection is established
            try:
                client.reconnect()     #reconnecting to the broker
                connected = True #if the connection is established, change status to connected and publish the events that happened to the topic noise/events
                print("connected")
                if not len(events)==0:
                    for x in events:
                        client.publish("noise/events",x)
                        sleep(0.01)
                    events.clear() #initialising the list for the next incoming connection error
                
            except:
                print("failed to connect retrying...")
                now = datetime.now() #if we couldn't reconnect
                dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
                #we save the reconnecting attempts to the events list
                events.append("[CONNECTION] " + dt_string + " reconnect attempt")
                #and we consume all the data we got from serial to check whether avehicule has passed or not
                while(ser.in_waiting > 0):
                    x = str(ser.readline(1000))
                    x = x.lstrip("b") #removing the extra characters from the data we got from serial
                    x = x.strip("'")
                    x = x.rstrip("\\r\\n")
                    z = x.split(" ") #if you see the form we are using to send data on arduino_code file at the bottom
                    #you will see that the biggest msg we have is noise:xx AVG:xx MAX:xx
                    #since we are only concerned with the noise(it's going to be in the first elemnt of the list after splitting on " " space character )
                    #we will only use the first element of the list to detect the pulses
                    x = z[0]
                    z = x.split(":")
                    #splitting on ':' character 
                    x = int(z[1]) #the data we need is in the second element of the list after spliting on ":" (noise:xx)->(xx)
                    if x>100: #if the noise is higher than 100 we consider it as vehicule
                        now = datetime.now()
                        dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
                        events.append("[VEHICULE] " + dt_string + " a vehicule has passed !!")
   
client.on_disconnect = on_disconnect #binding the on_disconnect function to the on_disconnect event in our mqtt client
while not connected:
    try:
        client.connect(broker_address,port)      #connect to broker
        connected = True #changing the connection status
        print("connected")
        client.reconnect_delay_set(min_delay=1, max_delay=2) #setting reconnecion delay
    except:
        print("failed to connect retrying...")

while True:
        x = str(ser.readline(1000)) #reading from serial
        x = x.lstrip("b")#cleaning data from extra characters
        x = x.strip("'")
        x = x.rstrip("\\r\\n")
        client.publish("noise",x) #publishing the data to the topic noise (noise:xx each second and noise:xx AVG:xx MAX:xx after every 10 seconds)
        z = x.split(" ")
        x = z[0]
        z = x.split(":")
        x = int(z[1])#same as before
        if x>100:
            client.publish("noise/pulses","pulse detected")#using topic noise/pulse to tell the broker that a vehicule has passed
            
        
        