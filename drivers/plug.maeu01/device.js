'use strict';

const Homey = require('homey');

const { ZigBeeDevice } = require('homey-meshdriver');
const util = require('./../../lib/util');
// const ZigBeeLightDevice = require('homey-meshdriver').ZigBeeLightDevice;

class AqaraSmartPlugEU extends ZigBeeDevice {

  onMeshInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    if (this.hasCapability('onoff')) {
      /**
       * Register a Homey Capability with a Cluster.
       * @param {string} capabilityId - The Homey capability id (e.g. `onoff`)
       * @param {string} clusterId - The Cluster id (e.g. `genBasic`)
       * @param {Object} [userOpts] - The object with options for this capability/cluster combination. These will extend system options, if available (`/lib/zigbee/system/`)
       * @param {number} [userOpts.endpoint=0] - An index to identify the endpoint to use for this capability
      */
      this.registerCapability('onoff', 'genOnOff', { endpoint: 0 });

      /**
      * Register an attribute report listener, which is called when a report has been received for the provided endpoint
      * cluster and attribute combination.
      * @param {string} clusterId - The ID of the cluster (e.g. `genOnOff`)
      * @param {string} attrId - The ID of the attribute (e.g. `onOff`)
      * @param {number} minInt - The minimal reporting interval in seconds (e.g. 1 (seconds))
      * @param {number} maxInt - The maximal reporting interval in seconds (e.g. 60 (seconds))
      * @param {number} repChange - Reportable change; the attribute should report its value when the value is changed more than this setting, for attributes of analog data type this argument is mandatory.
      * @param {Function} triggerFn - Function that will be called when attribute report data is received
      * @param {number} [endpointId=0] - The endpoint index (e.g. 0)
      * @returns {Promise} Resolves if configuration succeeded
      */

      this.registerAttrReportListener('genOnOff', 'onOff', 1, 60, null, data => {
        if (this.getCapabilityValue('onoff') !== (data === 1)) {
          this.log('onoff | genOnOff - onOff', data);
          return this.setCapabilityValue('onoff', data === 1);
        }
      }, 0);
    }

    if (this.hasCapability('measure_power')) {
      // Define acPower parsing factor based on device settings
      if (typeof this.acPowerFactor !== 'number') {
        const haElectricalMeasurementAttrs = this.node.endpoints[0].clusters['haElectricalMeasurement'].attrs;
        this.acPowerFactor = haElectricalMeasurementAttrs.acPowerMultiplier / haElectricalMeasurementAttrs.acPowerDivisor;
        this._debug('acPowerFactor:', this.acPowerFactor);
      }

      /**
      * Register an attribute report listener, which is called when a report has been received for the provided endpoint
      * cluster and attribute combination.
      */
      this.registerAttrReportListener('haElectricalMeasurement', 'activePower', 1, 3600, 1 / this.acPowerFactor, data => {
        const parsedPayload = data * this.acPowerFactor;
        this.log('measure_power | haElectricalMeasurement - activePower', parsedPayload);
        return this.setCapabilityValue('measure_power', parsedPayload);
      }, 0);
    }

    if (this.hasCapability('meter_power')) {
      // Define acCurrent parsing factor based on device settings
      if (typeof this.meteringFactor !== 'number') {
        const haElectricalMeasurementAttrs = this.node.endpoints[0].clusters['seMetering'].attrs;
        this.meteringFactor = haElectricalMeasurementAttrs.multiplier / haElectricalMeasurementAttrs.divisor;
        this._debug('meteringFactor:', this.meteringFactor);
      }

      /**
      * Register an attribute report listener, which is called when a report has been received for the provided endpoint
      * cluster and attribute combination.
      */
      this.registerAttrReportListener('seMetering', 'currentSummDelivered', 300, 3600, [null, 0.01 / this.meteringFactor], data => {
        const parsedPayload = data[1] * this.meteringFactor;
        this.log('meter_power | seMetering - currentSummDelivered', parsedPayload);
        return this.setCapabilityValue('meter_power', parsedPayload);
      }, 0);
    }
  }

}

module.exports = AqaraSmartPlugEU;
/*
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ------------------------------------------
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] Node: 9c5b5186-ad44-409f-9f5e-7c99e39a2d13
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] - Battery: false
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] - Endpoints: 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] -- Clusters:
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- zapp
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- genBasic
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- 65533 : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : genBasic
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- zclVersion : 3
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- appVersion : 22
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- stackVersion : 2
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- hwVersion : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- manufacturerName : LUMI
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- modelId : lumi.plug.maeu01
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- dateCode : 09-10-2019
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- powerSource : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- genDeviceTempCfg
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- 65533 : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : genDeviceTempCfg
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- currentTemperature : 23
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- devTempAlarmMask : 2
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- highTempThres : 65
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- highTempDwellTripPoint : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- genIdentify
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- 65533 : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : genIdentify
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- identifyTime : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- genGroups
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- 65533 : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : genGroups
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- nameSupport : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- genScenes
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- 65533 : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : genScenes
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- count : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- currentScene : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- currentGroup : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sceneValid : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- nameSupport : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- lastCfgBy : 0xffffffffffffffff
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- genOnOff
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- 65533 : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : genOnOff
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- onOff : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- globalSceneCtrl : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- genAlarms
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- 65533 : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : genAlarms
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- alarmCount : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- genTime
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : genTime
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- genOta
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : genOta
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- seMetering
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- 65533 : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : seMetering
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- currentSummDelivered : [ 0, 136 ]
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- status : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- unitOfMeasure : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- multiplier : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- divisor : 1000
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- summaFormatting : 35
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- demandFormatting : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- meteringDeviceType : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- haElectricalMeasurement
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- 65533 : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : haElectricalMeasurement
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- measurementType : 8
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- activePower : 0
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- acPowerMultiplier : 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- acPowerDivisor : 10
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- acAlarmsMask : 4
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- acActivePowerOverload : 2300
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] - Endpoints: 1
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] -- Clusters:
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- zapp
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] --- genGreenPowerProxy
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- cid : genGreenPowerProxy
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ---- sid : attrs
2020-02-25 13:19:52 [log] [ManagerDrivers] [plug.maeu01] [0] ------------------------------------------

{ '3': 32,							= soc_temperature
  '5': 4,
  '7': 0,
  '8': 4886,
  '9': 770,
  '59': 7289341,
  '62': 103021886,
  '100': 1,
  '253': 16 }

Cluster: genBasic (0x0000)
Atribute: Unknown (0xfff0)
Data Type: Octet String (0x41), length: 9
Disabled indicator: 	aa8005d14713031001
Enabled indicator:  	aa8005d14714031000

Power failure memory
enabled:  						aa8005d1472a011001
disabled: 						aa8005d14729011000	aa8005d1472b011000

Charging protection
enabled:							aa8005d1472c021001
disabled:							aa8005d1472d021000

*/
