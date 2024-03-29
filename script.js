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
let infoSpan; // DOM element where the incoming readings go
let timeSpan;     // DOM element for one special reading
let webserial;
var ask_erase = false;
var wait_erase = false;


var firmwareArray = null;

function setup() {
  // get the DOM elements and assign any listeners needed:
  // user text input:
  // span for incoming serial messages:
  infoSpan = document.getElementById("info");

  ubaudrate = document.getElementById("ubaud");

  readingsSpan = document.getElementById("readings");

  updateusb3_file = document.getElementById("file");
  updateusb3_file.addEventListener("change", updateUSB3);

  loader = document.getElementById("loader");

  infoSpan.innerHTML = "Configuré";

  
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

     zminus = document.getElementById("erase");
     zminus.addEventListener("click", Erase);
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

function log(data) {
	console.log(data);
	infoSpan.innerHTML = new Date().toLocaleTimeString() + ": " + data + "<br>";
}


var i = 0;
function move(pos) {

    var elem = document.getElementById("myBar");
    
    log(pos);
    
    elem.value = pos;
    elem.innerHTML = pos + "%";
}

async function SendFile(file) {
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    const firmwareArray = event.target.result;
    log("File was selected, size: " + firmwareArray.byteLength + " bytes");
    
    log(firmwareArray);
    


    log("Start");
    webserial.baudrate = ubaudrate.value;
    webserial.reloadbaudrate();
    webserial.sendSerial(firmwareArray);
    
    
    log("Stop");
    // Do something with result
  });

  if (file != null)
      reader.readAsArrayBuffer(file);
  else
      log("No file selected");

      // webserial.addEventListener('progress', (event) => {
      //   if (event.loaded && event.total) {
      //     const percent = (event.loaded / event.total) * 100;
      //     console.log(`Progress: ${Math.round(percent)}`);
      //   }
      // });

  
      
}

async function updateUSB3() {
  const fileList = event.target.files;
  console.log(fileList);
  file = fileList[0];

  log("Début effacement");
  ask_erase = true;
  Erase();
  log("On continue");


  
  
  
  log("Ici!!" + file.name);



  
  // document.querySelector("#file").addEventListener("change", function() {
    // const fileList = this.target.files;
    // log(fileList);
          
    //     if(webserial.port) {
    //       log("Selected : " + $(file.name));
    //     }
    //     else
    //     {
    //       log("COM Port closed");
    //     }
    //   if (this.files[0] != null)
    //       reader.readAsArrayBuffer(this.files[0]);
    //   else
    //       log("No file selected");
  }

async function openClosePort() {
  // label for the button will change depending on what you do:
  let buttonLabel = "Open port";
  // if port is open, close it; if closed, open it:
  if (webserial.port) {
    await webserial.closePort();
  } else {
    webserial.baudrate = ubaudrate.value;
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

async function Erase() {
  // webserial.closePort();
  // webserial.openPort_115200();
  let d = new Uint8Array(5); // word swire 10 bits = 10 bytes UART
  d[0] = 0x82; // start bit byte cmd swire = 1
  d[1] = 0x09; // start bit byte cmd swire = 1
  d[2] = 0x00; // start bit byte cmd swire = 1
  d[3] = 0x04; // start bit byte cmd swire = 1
  d[4] = 0xFF; // start bit byte cmd swire = 1
  webserial.sendSerial(d);
 
}


var pointer_byte = 0, buffer_byte = []; 
var createRingBuffer_byte = function(){
  return {
    get  : function(){
      var item;
      pointer_byte = (pointer_byte -1);
      item = buffer_byte[pointer_byte];
      return item;
    },
    push : function(item){
      buffer_byte[pointer_byte] = item;
      pointer_byte = (pointer_byte +1);
    },
    buffer_byte : buffer_byte
  };
};

var r_pointer = 0,w_pointer = 0, buffer = []; 
var createRingBuffer = function(){
  return {
    get  : function(){
      var item;
      item = buffer[r_pointer];
      // log("read");
      // log(item);
      // log(r_pointer);
      r_pointer = (r_pointer +1);
      return item;
    },
    push : function(item){
      buffer[w_pointer] = item;
      w_pointer = (w_pointer +1);
      // log("write");
      // log(item);
      // log(w_pointer);
    },
    buffer : buffer
  };
};



function serialRead(event) {
  var rbuffer_byte = createRingBuffer_byte(30);
  var rbuffer = createRingBuffer(30);
  for (let i=0;i<event.detail.data.byteLength;i++) {
    rbuffer_byte.push(event.detail.data[i]);
    if(event.detail.data[i] === 0xFF)
    {
      var size = pointer_byte;
      var message = new Uint8Array(pointer_byte); // word swire 10 bits = 10 bytes UART
      for (let j=0;j<size;j++) {
        message[size-j-1] = rbuffer_byte.get();
      }
      rbuffer.push(message);
  }  

  } 

  let ack = new Uint8Array(3); // word swire 10 bits = 10 bytes UART
  ack[0] = 0x90; // start bit byte cmd swire = 1
  ack[1] = 0x41; // start bit byte cmd swire = 1
  ack[2] = 0xFF; // start bit byte cmd swire = 1

  let comp = new Uint8Array(3); // word swire 10 bits = 10 bytes UART
  comp[0] = 0x90; // start bit byte cmd swire = 1
  comp[1] = 0x51; // start bit byte cmd swire = 1
  comp[2] = 0xFF; // start bit byte cmd swire = 1

  let ack_fpga = new Uint8Array(3); // word swire 10 bits = 10 bytes UART
  ack_fpga[0] = 0xA0; // start bit byte cmd swire = 1
  ack_fpga[1] = 0x41; // start bit byte cmd swire = 1
  ack_fpga[2] = 0xFF; // start bit byte cmd swire = 1

  let comp_fpga = new Uint8Array(3); // word swire 10 bits = 10 bytes UART
  comp_fpga[0] = 0xA0; // start bit byte cmd swire = 1
  comp_fpga[1] = 0x51; // start bit byte cmd swire = 1
  comp_fpga[2] = 0xFF; // start bit byte cmd swire = 1

  readingsSpan.innerHTML = event.detail.data
  log(event.detail.data);
  while (w_pointer > r_pointer)
  {
    log("There is a message")
    let new_message = rbuffer.get();
    log(new_message);
    
    if((new_message.every((element, index) => element === ack_fpga[index])))
    {
      log("ACK FPGA!");
      if (ask_erase === true)
      {
        log("Erasing!");
        loader.style.display = 'block';
        wait_erase = true;
        ask_erase = false;
      }
    }
    else if((new_message.every((element, index) => element === comp_fpga[index])))
    {
      log("Completion FPGA!");
      if (wait_erase === true)
      {
        wait_erase = false;
        SendFile(file);
      }
      loader.style.display = 'none';
    }
    else if((new_message.every((element, index) => element === ack[index])))
    {
      log("ACK!");
    }
    else if((new_message.every((element, index) => element === comp[index])))
    {
      log("Completion!");
    }
  }

  
}

// run the setup function when all the page is loaded:
document.addEventListener("DOMContentLoaded", setup);