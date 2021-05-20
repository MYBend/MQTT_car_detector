#include <Arduino.h>
#include <string.h>
int incomingAudio;
int count=0,maxi=0,sum=0; // count used to know whether we reached the 10th last second or not, maxi is for the maximum and sum is used to calculate the average
int avg=0;
void setup(){
 Serial.begin(115200);
}

char msg[32]; //msg to be sent
char append[4]; //a cahr variable used to store the converted int -> char and append this latter to the msg

void loop(){
  incomingAudio = analogRead(A0);// reading from analogic input A0
  strcat(msg,"noise:");
  sprintf(append,"%d",incomingAudio);
  strcat(msg,append);
  sum  += incomingAudio; // adding the value read to the sum
  if (incomingAudio >maxi) maxi = incomingAudio; // calculating the max
  count++;
  if (count == 10){ // if we reached the last second we caculate the avg and add this latter with the max to the msg to be sent
      count = 0; // we wil aslso reinitialise the counter and sum and max to 0 for the next 10 seconds
      avg = sum/10;
      strcat(msg," AVG:");
      sprintf(append,"%d",avg);
      strcat(msg,append);
      strcat(msg," MAX:");
      sprintf(append,"%d",maxi);
      strcat(msg,append);
      sum = 0;
      maxi = 0;
  }
  Serial.println(msg);//send the msg through serial
  strcpy(msg, ""); //reinitialising the msg to an empty string for the next 10 seconds
  delay(1000); // wait 1 second for every iteration
  /*
   * we have to kind of msgs the first one is noise:something
   * and the second is : noise:something AVG;something MAX:something
   * we used this format so we can manipulate it easily later on python or javascript
   */
}
