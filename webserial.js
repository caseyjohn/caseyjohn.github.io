/*
  WebSerial wrapper
  Simplifies WebSerial
*/

// need self = this for connect/disconnect functions
let self;

class WebSerialPort {
  constructor() {
    // if webserial doesn't exist, return false:
    if (!navigator.serial) {
      alert("WebSerial is not enabled in this browser");
      return false;
    }
    this.autoOpen = true;
    // copy this to a global variable so that
    // connect/disconnect can access it:
    self = this;

    // basic WebSerial properties:
    this.port;
    this.reader;
    this.serialReadPromise;

    this.baudrate;
    // add an incoming data event:
    // TODO: data should probably be an ArrayBuffer or Stream
    this.incoming = {
      data: null
    }
    // incoming serial data event:
    this.dataEvent = new CustomEvent('data', {
      detail: this.incoming,
      bubbles: true
    });

    // so that you can change button names on 
    // connect or disconnect:
    navigator.serial.addEventListener("connect", this.serialConnect);
    navigator.serial.addEventListener("disconnect", this.serialDisconnect);

    // if the calling script passes in a message
    // and handler, add them as event listeners:
    this.on = (message, handler) => {
      parent.addEventListener(message, handler);
    };
  }

  async openPort(thisPort) {
    try {
      // if no port is passed to this function, 
      if (thisPort == null) {
        // pop up window to select port:
        this.port = await navigator.serial.requestPort({
        });
      } else {
        // open the port that was passed:
        this.port = thisPort;
      }
      // set port settings and open it:
      await this.port.open({ baudRate: this.baudrate });
      // start the listenForSerial function:
      this.serialReadPromise = this.listenForSerial();

    } catch (err) {
      // if there's an error opening the port:
      console.error("There was an error opening the serial port:", err);
    }
  }

  async reloadbaudrate() {
    try {
      // if no port is passed to this function, 
      this.reader.cancel();
      log("reload");
      await this.serialReadPromise;
      await new Promise(r => setTimeout(r, 1000));
      await this.port.close();
      await this.port.open({ baudRate: this.baudrate });
      this.serialReadPromise = this.listenForSerial();
      log("reload done");
    } catch (err) {
      // if there's an error opening the port:
      console.error("There was an error reloading the serial port:", err);
    }
  }

 

  async closePort() {
    if (this.port) {
      // stop the reader, so you can close the port:
      this.reader.cancel();
      // wait for the listenForSerial function to stop:
      await this.serialReadPromise;
      // close the serial port itself:
      await this.port.close();
      // clear the port variable:
      this.port = null;
    }
  }

  
  async sendSerial(data) {
    // if there's no port open, skip this function:
    try {
      if (!this.port) return;
      // if the port's writable: 
      if (this.port.writable) {
        
        // initialize the writer:
        const writer = this.port.writable.getWriter();
        await writer.ready;
        // Write data
        await writer.write(data);
        await writer.ready;
        // release lock
        await writer.releaseLock();
        
      }
    } catch (err) {
      // if there's an error opening the port:
      console.error("There was an error writing on the serial port:", err);
    }
  }

  async listenForSerial() {
    // if there's no serial port, return:
    if (!this.port) return;
    // while the port is open:
    while (this.port.readable) {
      // initialize the reader:
      this.reader = this.port.readable.getReader();
      try {
        // read incoming serial buffer:
        const { value, done } = await this.reader.read();
        if (value) {
          // convert the input to a text string:
          this.incoming.data = value;

          // fire the event:
          parent.dispatchEvent(this.dataEvent);
        }
        if (done) {
          break;
        }
      } catch (error) {
        // if there's an error reading the port:
        console.log(error);
      } finally {
        this.reader.releaseLock();
      }
    }
  }

  // this event occurs every time a new serial device
  // connects via USB:
  serialConnect(event) {
    console.log(event.target);
    // TODO: make autoOpen configurable
    if (self.autoOpen) {
      self.openPort(event.target);
    }
  }

  // this event occurs every time a new serial device
  // disconnects via USB:
  serialDisconnect(event) {
    console.log(event.target);
  }
}