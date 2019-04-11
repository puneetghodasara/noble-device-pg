
class Device {

    constructor(peripheral){
        this.peripheral = peripheral;
    }

    get id() {
        return this.peripheral.id;
    }

    get address() {
        return this.peripheral.address;
    }
}

module.exports = Device;