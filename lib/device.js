
class Device {
    constructor(peripheral) {
        this.peripheral = peripheral;
        this._connected = false;
        this._services = {};
        this._characteristics = {};
    }


    get connected() {
        return this._connected;
    }

    get localName() {
        return this.peripheral.advertisement.localName;
    }

    get serviceUuids() {
        return this.peripheral.advertisement.serviceUuids;
    }

    get id() {
        return this.peripheral.id;
    }

    get address() {
        return this.peripheral.address;
    }

    onDisconnect(callback) {
        this._connected = false;
    };

    connect(callback) {
        this.peripheral.connect((error) => {
            if (!error) {
                this.peripheral.once('disconnect', this.onDisconnect.bind(this));
                this._connected = true;
            }
            callback(error);
        });
    }

    discover(callback) {
        this.peripheral.discoverAllServicesAndCharacteristics((error, services) => {
            if (error) {
                return callback(error);
            }

            services.forEach((service) => {
                this._services[service.uuid] = service;
                this._characteristics[service.uuid] = {};

                service.characteristics.forEach((char) => {
                    this._characteristics[service.uuid][char.uuid] = char;
                });
            });

            callback();
        });
    }

    disconnect(callback) {
        this.peripheral.disconnect(callback);
    }

    writeUInt8Characteristic(serviceUuid, characteristicUuid, value, callback) {
        const buffer = new Buffer(1);
        buffer.writeUInt8(value, 0);

        this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
    }

    hasService(serviceUuid) {
        return (!!this._characteristics[serviceUuid]);
    };

    hasCharacteristic(serviceUuid, characteristicUuid) {
        return this.hasService(serviceUuid) && (!!this._characteristics[serviceUuid][characteristicUuid]);
    };

    writeDataCharacteristic(serviceUuid, characteristicUuid, data, callback) {
        if (!this.hasService(serviceUuid)) {
            return callback(new Error('service uuid ' + serviceUuid + ' not found!'));
        } else if (!this.hasCharacteristic(serviceUuid, characteristicUuid)) {
            return callback(new Error('characteristic uuid ' + characteristicUuid + ' not found in service uuid ' + serviceUuid + '!'));
        }

        const characteristic = this._characteristics[serviceUuid][characteristicUuid];

        const withoutResponse = (characteristic.properties.indexOf('writeWithoutResponse') !== -1) &&
            (characteristic.properties.indexOf('write') === -1);

        characteristic.write(data, withoutResponse, function (error) {
            if (typeof callback === 'function') {
                callback(error);
            }
        });
    };

    notifyCharacteristic(serviceUuid, characteristicUuid, notify, listener, callback) {
        if (!this.hasService(serviceUuid)) {
            return callback(new Error('service uuid ' + serviceUuid + ' not found!'));
        } else if (!this.hasCharacteristic(serviceUuid, characteristicUuid)) {
            return callback(new Error('characteristic uuid ' + characteristicUuid + ' not found in service uuid ' + serviceUuid + '!'));
        }

        const characteristic = this._characteristics[serviceUuid][characteristicUuid];

        characteristic.notify(notify, function (error) {
            if (notify) {
                characteristic.addListener('data', listener);
            } else {
                characteristic.removeListener('data', listener);
            }

            if (typeof callback === 'function') {
                callback(error);
            }
        });
    };
}

module.exports = Device;