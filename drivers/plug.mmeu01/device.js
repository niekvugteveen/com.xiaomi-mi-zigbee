'use strict';

const Homey = require('homey');

const { ZigBeeDevice } = require('homey-meshdriver');
const util = require('./../../lib/util');
// const ZigBeeLightDevice = require('homey-meshdriver').ZigBeeLightDevice;

class XiaomiSmartPlugEU extends ZigBeeDevice {

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
      this.registerAttrReportListener('genAnalogInput', 'presentValue', 5, 600, 1, data => {
        const parsedPayload = data; // * this.acPowerFactor;
        this.log('measure_power | genAnalogInput - presentValue', parsedPayload);
        return this.setCapabilityValue('measure_power', parsedPayload);
      }, 1);

      // Register the AttributeReportListener for measure_humidity
      this._attrReportListeners['20_genAnalogInput'] = this._attrReportListeners['20_genAnalogInput'] || {};
      this._attrReportListeners['20_genAnalogInput']['presentValue'] =				this.onPowerReport.bind(this);
    }

    if (this.hasCapability('meter_power')) {
      this.registerAttrReportListener('genAnalogInput', 'presentValue', 5, 3600, 1, data => {
        const parsedPayload = data; // [1] * this.meteringFactor;
        this.log('meter_power | genAnalogInput - presentValue', parsedPayload);
        return this.setCapabilityValue('meter_power', parsedPayload);
      }, 2);

      // Register the AttributeReportListener for measure_humidity
      this._attrReportListeners['21_genAnalogInput'] = this._attrReportListeners['21_genAnalogInput'] || {};
      this._attrReportListeners['21_genAnalogInput']['presentValue'] =					this.onMeterReport.bind(this);

      this.registerCapability('meter_power', 'genAnalogInput', {
        get: 'presentValue',
        getOpts: {
          pollInterval: 300000,
        },
        report: 'presentValue',
        reportParser(value) {
          this.log('meter_power | genAnalogInput - presentValue:', value);
          return value;
        },
        endpoint: 2,
      });
    }
  }

  onPowerReport(value) {
    this.log('measure_power | genAnalogInput - presentValue:', value);
    this.setCapabilityValue('measure_power', value);
  }

  onMeterReport(value) {
    this.log('meter_power | genAnalogInput - presentValue:', value);
    // this.setCapabilityValue('measure_temperature', parsedValue + temperatureOffset);
  }

}

module.exports = XiaomiSmartPlugEU;
/*
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ------------------------------------------
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] Node: ffabe1c8-373b-4974-9d5f-37f9c63bd2be
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] - Battery: false
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] - Endpoints: 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] -- Clusters:
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- 64704
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 247 : d(�9�9�~Y>�9�E�9!�!'	!
                                                                                                  �
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 519 : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : 64704
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- zapp
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genBasic
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 65533 : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genBasic
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- zclVersion : 3
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- appVersion : 22
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- stackVersion : 2
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- hwVersion : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- manufacturerName : LUMI
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- modelId : lumi.plug.mmeu01
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- dateCode : 09-06-2019
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- powerSource : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genDeviceTempCfg
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 65533 : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genDeviceTempCfg
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- currentTemperature : 30
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- devTempAlarmMask : 2
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- highTempThres : 65
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- highTempDwellTripPoint : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genIdentify
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 65533 : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genIdentify
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- identifyTime : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genGroups
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 65533 : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genGroups
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- nameSupport : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genScenes
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 65533 : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genScenes
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- count : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- currentScene : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- currentGroup : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sceneValid : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- nameSupport : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- lastCfgBy : 0xffffffffffffffff
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genOnOff
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 245 : 50331392
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 65533 : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genOnOff
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- onOff : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- globalSceneCtrl : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genTime
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genTime
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genOta
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genOta
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] - Endpoints: 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] -- Clusters:
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- zapp
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genAnalogInput
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 65533 : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genAnalogInput
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- outOfService : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- presentValue : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- statusFlags : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- applicationType : 589824
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] - Endpoints: 2
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] -- Clusters:
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- zapp
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genAnalogInput
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- 65533 : 1
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genAnalogInput
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- outOfService : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- presentValue : 0.21239805221557617
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- statusFlags : 0
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- applicationType : 720896
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] - Endpoints: 3
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] -- Clusters:
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- zapp
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] --- genGreenPowerProxy
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- cid : genGreenPowerProxy
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ---- sid : attrs
2020-02-25 20:33:25 [log] [ManagerDrivers] [plug.mmeu01] [0] ------------------------------------------
*/
