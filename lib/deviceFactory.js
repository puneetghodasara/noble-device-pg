const noble = require('noble');
const EventEmitter = require("events");
const Device = require('./device');

class NobleDeviceFactory {

    constructor() {
        this._discovering = false;
        this._requestDiscover = false;
        this.eventEmitter = new EventEmitter();
        noble.on('discover', this._onDiscover.bind(this));
        noble.on('stateChange', this._onStateChange.bind(this));
        this._state = "";
    }

    get canStart(){
        return (this._state === 'poweredOn' && this._requestDiscover && !this._discovering);
    }

    _onEmit(device) {
        // Default implementation does nothing
        console.log("Peripheral Emmited " + device);
    }

    _onStateChange(state) {
        this._state = state;
        console.log("State changed to " + state);
        if (this.canStart) {
            this._startScanning();
        } else {
            // TODO remove
            console.debug(" Doing Nothing")
        }
    }

    _onDiscover(peripheral) {
        if (NobleDeviceFactory._is(peripheral)) {
            this.eventEmitter.emit('discover', this._convert(peripheral));
        }
    }

    _convert(peripheral) {
        return new Device(peripheral);
    };

    static _is(peripheral) {
        return true;
    };

    _discover() {
        console.log("Started Discovering...");
    };

    _startScanning() {
        console.debug("Started Scan");
        this.eventEmitter.addListener("discover", this._onEmit);
        this._discovering = true;
        this._requestDiscover = false;
        noble.startScanning([], false);
    }

    stopDiscover() {
        console.debug("Stopping Scan");
        if (this._discovering) {
            noble.stopScanning();
            this._discovering = false;
            this.eventEmitter.removeAllListeners("discover");
            console.debug("Stopped discovery");
        }
    };

    _discoverWithFilter(filter, callback) {
        if(this._requestDiscover){
            console.error("Another Request is pending");
            return;
        }

        this._requestDiscover = true;
        let _that = this;
        this._onEmit = function (device) {
            if (filter(device)) {
                _that.stopDiscover();

                callback(device);
            }
        };

        this._discover();
    }
    ;

    discoverById(id, callback) {
        this._discoverWithFilter(function (device) {
            return (device.id === id);
        }, callback);
    }
    ;

    discoverByAddress(address, callback) {
        this._discoverWithFilter(function (device) {
            return (device.address === address);
        }, callback);
    }
    ;

}

module.exports = NobleDeviceFactory;
