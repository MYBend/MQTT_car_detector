var ctx = document.getElementById('myChart').getContext('2d');
var labels = ["second 1","second 2","second 3","second 4","second 5","second 6","second 7","second 8","second 9","second 10"] //labels for the chart
var data = ["","","","","","","","","","","","","","","","0","32"]//first data in the chart we added 0 and 32 so it won't look weird when value are getting hiegher
//if we dont do that (the lowest and biggest noise value is not going to be 0 and 32 so it will be dynamic and it wont look good)(it makes the user thing that a value like 34 is zero if the other values in the data are bigger that this latter )
var count = 0;//counter as in the arduino code but this time is mainly use to positing the data in the graph
var pulses = 0; //number of pulses detected
//var temp_pulses = 0; unsed variable
var max;
var avg;
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    // The data for our dataset
    data: {
        labels: labels,
        datasets: [{
            label: 'NOISE',
            backgroundColor: 'rgb(0, 99, 132)',
            borderColor: 'rgb(0, 99, 132)',
            data: data
        }]
    },

    // Configuration options go here and we have none
    options: {}
});

var mqtt; // variable that going to contain an istance of the mqtt client
var payload; //payload is going to containthe msg we got the the noise/# topic
var txtArea; //used for manipulating textareas in html it's not necessary to use it but just to make the code less complicated
var currentdate;
var datetime;
//var reconnect = true; it was here but since we are no longer using it we're going to delete it
	var reconnectTimeout = 2000; // setting reconnection time out to 2seconds
	var host="localhost"; 
	var port=1883;
	var str,slice; //str is going to contain the array after splitting on ' ' space character
	function onConnectionLost(){ // called when connection is lost
	count = 0; // initializing counter for future reads
	document.getElementById("txt").innerHTML = "Disconnected"; // updating mqtt client's status for the user
	MQTTconnect(); //trying to connect again and the connect has an infinite loop that is going to  try to reconnect everytime the connection is not established
	}

	function onFailure(message) {// if we couldn't connect try again after timeout (used in MQTTconnect function)
		document.getElementById("txt").innerHTML = "failed";
		setTimeout(MQTTconnect, reconnectTimeout);
      }
  
	function onMessageArrived(msg){// when msg arrived from the topic noise/# (noise and noise/pulses and noises/events)
		payload = msg.payloadString;
		if (payload.includes("pulse")){ // if the msg we got contains pulse it means a vehicule has passed (pulse detected)
			pulses++;
			document.getElementById("nbv").innerHTML = "VEHICULES : " + pulses;
			
		}
		else {//if it doesn't contain the string pulse
		str = payload.split(" ");
		if (str.length>3){// we see if the array hass more than 3 elemnets (has more than noise:xx AVG:xx MAX:xx) if yes it means it's a missed events msg that came from noise/events
			txtArea = document.getElementById("missed_events") ; //we display the missed event in the events textarea
			txtArea.value =  payload + '\r\n' + txtArea.value;
			if (payload.includes("[VEHICULE]")){ //if it contains vehicule we increment the number of vehicules as well
				pulses++;
				document.getElementById("nbv").innerHTML = "VEHICULES : " + pulses;
			}
		}
		else {//we are working with the (noise:xx AVG:xx MAX:xx) msg here
			slice = str[0].split(":");//getting first elemnt that contains noise
		document.getElementById("txt").innerHTML = "MSG ARRIVED : " + slice[1];
		if (count == 0) {//cheking if the 10 seconds has reached in order to start adding the new data on a new graph of zeros
			for (var i =0;i<10;i++){
				data[i]="0";
			}
			
		}
		data[count] = slice[1];//adding data to the right place
		chart.update();//updating the graph
		count++;
		//slice = str[0].split(":"); deleted because it was repetetive
		
		if (str.length>1){// if the msg doesnt contain noise:only (it also has max and avg)
			count = 0;
			slice = str[2].split(":");//getting the max from it's position in the str array and displaying it after spliting again on ':'
			max = parseInt(slice[1]);
			document.getElementById("max").innerHTML = "MAX : " + max;
			slice = str[1].split(":");
			avg = parseInt(slice[1]);
			document.getElementById("avg").innerHTML = "AVG : " + avg;
			currentdate = new Date(); //getting date instance
			datetime = "Last Sync: " + currentdate.getDate() + "/" //creating a date string with the right format
                + ("0" + (currentdate.getMonth()+1)).slice(-2)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + ("0" + currentdate.getHours()).slice(-2) + ":"  
                + ("0" + currentdate.getMinutes()).slice(-2) + ":" 
                + ("0" + currentdate.getSeconds()).slice(-2);
			txtArea;
			txtArea = document.getElementById("log") ;
			txtArea.value =  datetime + "  MAX : " + max + " AVG : " + avg + '\r\n' + txtArea.value;//displaying max and avg of the last 10 senconds
		}
		}
		}
	}
	
	function onConnect() {//what happens when we connect and initializing counter and displayed information for the user
		count = 0;
		document.getElementById("nbv").innerHTML = "VEHICULES : 0";
		document.getElementById("avg").innerHTML = "AVG : waiting";
		document.getElementById("max").innerHTML = "MAX : waiting";
		document.getElementById("txt").innerHTML = "connected";
		mqtt.subscribe("noise/#"); //subscribing to the topic noise and it's subtopics
	}
	
	
	

	function MQTTconnect() { //creating an mqtt client instqnce and configuring it with the right info
		document.getElementById("txt").innerHTML = "connecting";//chaging status msg for the used
		mqtt = new Paho.MQTT.Client(host,port,"clientjs");
		//binding functions and configuring timeout
		var options = {
			timeout: 3,
			onSuccess: onConnect,
			onFailure: onFailure,
			 };
		mqtt.onMessageArrived = onMessageArrived;
		mqtt.onConnectionLost = onConnectionLost;
		mqtt.connect(options);//connecting
	}
