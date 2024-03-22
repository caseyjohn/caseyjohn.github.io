/*
WebSerial example
Reads from a webSerial serial port, and writes to it.
Works on Chrome and Edge and Opera browsers. 

created 28 Jan 2022
modified 15 May 2022
by Tom Igoe
*/


// the DOM elements that might be changed by various functions:
let portButton;   // the open/close port button
let readingsSpan; // DOM element where the incoming readings go
let timeSpan;     // DOM element for one special reading
let webserial;

function setup() {
  // get the DOM elements and assign any listeners needed:
  // user text input:
  // span for incoming serial messages:
  readingsSpan = document.getElementById("readings");

  
  webserial = new WebSerialPort();
  if (webserial) {
    webserial.on("data", serialRead);
     // port open/close button:
     portButton = document.getElementById("portButton");
     portButton.addEventListener("click", openClosePort);

     zplus = document.getElementById("zplus");
     zplus.addEventListener("mousedown", ZoomPlus);
     zplus.addEventListener("mouseup", ZoomStop);

     zminus = document.getElementById("zminus");
     zminus.addEventListener("mousedown", ZoomMinus);
     zminus.addEventListener("mouseup", ZoomStop);
   }

   var video = document.querySelector("#videoElement");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
    });
}

}

async function openClosePort() {
  // label for the button will change depending on what you do:
  let buttonLabel = "Open port";
  // if port is open, close it; if closed, open it:
  if (webserial.port) {
    await webserial.closePort();
  } else {
    await webserial.openPort();
    buttonLabel = "Close port";
  }
  // change button label:
  portButton.innerHTML = buttonLabel;
}

async function ZoomPlus() {
  let d = new Uint8Array(6); // word swire 10 bits = 10 bytes UART
  d[0] = 0x81; // start bit byte cmd swire = 1
  d[1] = 0x01; // start bit byte cmd swire = 1
  d[2] = 0x04; // start bit byte cmd swire = 1
  d[3] = 0x07; // start bit byte cmd swire = 1
  d[4] = 0x25; // start bit byte cmd swire = 1
  d[5] = 0xFF; // start bit byte cmd swire = 1

  webserial.sendSerial(d);
 
}

async function ZoomMinus() {
  let d = new Uint8Array(6); // word swire 10 bits = 10 bytes UART
  d[0] = 0x81; // start bit byte cmd swire = 1
  d[1] = 0x01; // start bit byte cmd swire = 1
  d[2] = 0x04; // start bit byte cmd swire = 1
  d[3] = 0x07; // start bit byte cmd swire = 1
  d[4] = 0x35; // start bit byte cmd swire = 1
  d[5] = 0xFF; // start bit byte cmd swire = 1

  webserial.sendSerial(d);
 
}

async function ZoomStop() {
  let d = new Uint8Array(6); // word swire 10 bits = 10 bytes UART
  d[0] = 0x81; // start bit byte cmd swire = 1
  d[1] = 0x01; // start bit byte cmd swire = 1
  d[2] = 0x04; // start bit byte cmd swire = 1
  d[3] = 0x07; // start bit byte cmd swire = 1
  d[4] = 0x00; // start bit byte cmd swire = 1
  d[5] = 0xFF; // start bit byte cmd swire = 1

  webserial.sendSerial(d);
 
}

function serialRead(event) {
  readingsSpan.innerHTML = event.detail.data
  ;
}

// run the setup function when all the page is loaded:
document.addEventListener("DOMContentLoaded", setup);