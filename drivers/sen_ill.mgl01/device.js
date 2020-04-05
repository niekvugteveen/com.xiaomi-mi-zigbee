'use strict';

const { ZigBeeDevice } = require('homey-meshdriver');
const util = require('./../../lib/util');

class XiaomiLightSensor extends ZigBeeDevice {

  onMeshInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    if (this.hasCapability('measure_battery')) {
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

      this.registerAttrReportListener('genPowerCfg', 'batteryVoltage', 30, 43200, 1, data => {
        const voltage = data * 100;
        let percentage = null;

        if (voltage < 2100) {
          percentage = 0;
        } else if (voltage < 2440) {
          percentage = 6 - ((2440 - voltage) * 6) / 340;
        } else if (voltage < 2740) {
          percentage = 18 - ((2740 - voltage) * 12) / 300;
        } else if (voltage < 2900) {
          percentage = 42 - ((2900 - voltage) * 24) / 160;
        } else if (voltage < 3000) {
          percentage = 100 - ((3000 - voltage) * 58) / 100;
        } else if (voltage >= 3000) {
          percentage = 100;
        }

        const parsedPayload = Math.round(percentage);
        this.log('measure_battery | genPowerCfg - batteryVoltage:', voltage, 'calculated batteryPercentage:', parsedPayload);
        return this.setCapabilityValue('measure_battery', parsedPayload);
      }, 0);

      // Register the AttributeReportListener for measure_humidity
      // this._attrReportListeners['0_genPowerCfg'] = this._attrReportListeners['0_genPowerCfg'] || {};
      // this._attrReportListeners['0_genPowerCfg']['batteryVoltage'] =
      //	this.onBatteryVoltageReport.bind(this);
    }

    if (this.hasCapability('alarm_battery')) {
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

      this.registerAttrReportListener('genPowerCfg', 'batteryAlarmState', 3600, 43200, 1, data => {
        const parsedPayload = data === 1;
        this.log('alarm_battery | genPowerCfg - batteryAlarmState', parsedPayload);
        if (this.getCapabilityValue('alarm_battery') !== parsedPayload) {
          return this.setCapabilityValue('alarm_battery', parsedPayload);
        }
      }, 0);

      // Register the AttributeReportListener for measure_humidity
      this._attrReportListeners['0_genPowerCfg'] = this._attrReportListeners['0_genPowerCfg'] || {};
      this._attrReportListeners['0_genPowerCfg']['batteryAlarmState'] = this.onBatteryAlarmReport.bind(this);
    }

    if (this.hasCapability('measure_luminance')) {
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

      this.registerAttrReportListener('msIlluminanceMeasurement', 'measuredValue', 60, 600, 4772, data => {
        const parsedPayload = 10 ** ((data - 1) / 10000); // Lux = 10^((data-1)/10000)
        this.log('measure_luminance | msIlluminanceMeasurement - measuredValue', parsedPayload);
        return this.setCapabilityValue('measure_luminance', parsedPayload);
      }, 0);
    }
  }

  onBatteryVoltageReport(data) {
    const voltage = data;
    let percentage = null;

    if (voltage < 2100) {
      percentage = 0;
    } else if (voltage < 2440) {
      percentage = 6 - ((2440 - voltage) * 6) / 340;
    } else if (voltage < 2740) {
      percentage = 18 - ((2740 - voltage) * 12) / 300;
    } else if (voltage < 2900) {
      percentage = 42 - ((2900 - voltage) * 24) / 160;
    } else if (voltage < 3000) {
      percentage = 100 - ((3000 - voltage) * 58) / 100;
    } else if (voltage >= 3000) {
      percentage = 100;
    }

    const parsedPayload = Math.round(percentage);
    this.log('measure_battery 2 | genPowerCfg - batteryVoltage:', voltage, 'calculated batteryPercentage:', parsedPayload);
    this.setCapabilityValue('measure_battery', parsedPayload);
  }

  onBatteryAlarmReport(data) {
    const parsedPayload = data === 1;
    this.log('alarm_battery | genPowerCfg - batteryAlarmState', parsedPayload);
    if (this.getCapabilityValue('alarm_battery') !== parsedPayload) {
      return this.setCapabilityValue('alarm_battery', parsedPayload);
    }
  }

}

module.exports = XiaomiLightSensor;

// RTCGQ11LM_sensor_motion

/*
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ------------------------------------------
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] Node: 555d5398-ab91-457a-a930-51b9576da411
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] - Battery: true
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] - Endpoints: 0
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] -- Clusters:
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] --- zapp
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] --- genBasic
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- 9 : 227
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- 10 : bwl
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- 11 : www.aqara.com
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- 65533 : 1
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- cid : genBasic
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- sid : attrs
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- zclVersion : 3
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- appVersion : 21
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- stackVersion : 2
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- hwVersion : 1
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- manufacturerName : LUMI
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- modelId : lumi.sen_ill.mgl01
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- dateCode : 20191118
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- powerSource : 3
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- appProfileVersion : 255
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- swBuildId : 2019www.
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] --- genPowerCfg
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- 65533 : 1
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- cid : genPowerCfg
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- sid : attrs
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- batteryVoltage : 32
2020-02-25 13:23:47 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- batterySize : 7
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- batteryQuantity : 1
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- batteryRatedVoltage : 30
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- batteryAlarmMask : 1
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- batteryVoltMinThres : 27
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- batteryAlarmState : 0
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] --- genIdentify
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- 65533 : 1
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- cid : genIdentify
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- sid : attrs
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- identifyTime : 0
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] --- msIlluminanceMeasurement
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- 65533 : 1
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- cid : msIlluminanceMeasurement
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- sid : attrs
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- measuredValue : 15564
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- minMeasuredValue : 1
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- maxMeasuredValue : 50000
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- tolerance : 0
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ---- lightSensorType : 1
2020-02-25 13:23:48 [log] [ManagerDrivers] [sen_ill.mgl01] [0] ------------------------------------------

65281 - 0xFF01 report:

{ '1': 3069,	= Battery
  '3': 23,
  '4': 12797,
  '5': 41,
  '6': 5,
  '10': 0,
  '11': 253,
  '100': 0
}

*/
