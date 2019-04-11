
class Device {

    constructor(peripheral){
        this.peripheral = peripheral;
    }

    get localName(){
        return this.peripheral.advertisement.localName;
    }

    get serviceUuids(){
        return this.peripheral.advertisement.serviceUuids;
    }

    get id() {
        return this.peripheral.id;
    }

    get address() {
        return this.peripheral.address;
    }
}

module.exports = Device;