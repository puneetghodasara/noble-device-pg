const DeviceFactory = require('../lib/deviceFactory');

const deviceFactory = new DeviceFactory();
deviceFactory.discoverById("a434f1f37d92", (device)=>{
    console.log("Device Found :" + device.id + ", " + device.address)
});