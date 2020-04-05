'use strict';

const { ZigBeeDevice } = require('homey-meshdriver');
const util = require('./../../lib/util');

class XiaomiTempSensor extends ZigBeeDevice {

  onMeshInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // Link util parseData method to this devices instance
    this.parseData = util.parseData.bind(this);

    // Register the AttributeReportListener for measure_temperature
    this._attrReportListeners['0_msTemperatureMeasurement'] = this._attrReportListeners['0_msTemperatureMeasurement'] || {};
    this._attrReportListeners['0_msTemperatureMeasurement']['measuredValue'] =			this.onTemperatureReport.bind(this);

    // Register the AttributeReportListener for measure_humidity
    this._attrReportListeners['0_msRelativeHumidity'] = this._attrReportListeners['0_msRelativeHumidity'] || {};
    this._attrReportListeners['0_msRelativeHumidity']['measuredValue'] =			this.onHumidityReport.bind(this);

    this._attrReportListeners['0_genBasic'] = this._attrReportListeners['0_genBasic'] || {};
    this._attrReportListeners['0_genBasic']['65281'] =			this.onLifelineReport.bind(this);
  }

  onTemperatureReport(value) {
    const parsedValue = this.getSetting('temperature_decimals') === '2' ? Math.round((value / 100) * 100) / 100 : Math.round((value / 100) * 10) / 10;
    const temperatureOffset = this.getSetting('temperature_offset') || 0;
    this.log('msTemperatureMeasurement - measuredValue (temperature):', parsedValue, '+ temperature offset', temperatureOffset);
    this.setCapabilityValue('measure_temperature', parsedValue + temperatureOffset);
  }

  onHumidityReport(value) {
    const humidityOffset = this.getSetting('humidity_offset') || 0;
    const parsedValue = this.getSetting('humidity_decimals') === '2' ? Math.round((value / 100) * 100) / 100 : Math.round((value / 100) * 10) / 10;
    this.log('msRelativeHumidity - measuredValue (humidity):', parsedValue, '+ humidity offset', humidityOffset);
    this.setCapabilityValue('measure_humidity', parsedValue + humidityOffset);
  }

  onLifelineReport(value) {
    this._debug('lifeline report', new Buffer(value, 'ascii'));

    const parsedData = this.parseData(new Buffer(value, 'ascii'));
    this._debug('parsedData', parsedData);

    // battery reportParser (ID 1)
    if (parsedData.hasOwnProperty('1')) {
      const parsedVolts = parsedData['1'] / 1000;
      const minVolts = 2.5;
      const maxVolts = 3.0;

      const parsedBatPct = Math.min(100, Math.round((parsedVolts - minVolts) / (maxVolts - minVolts) * 100));
      this.log('lifeline - battery', parsedBatPct);
      if (this.hasCapability('measure_battery') && this.hasCapability('alarm_battery')) {
        // Set Battery capability
        this.setCapabilityValue('measure_battery', parsedBatPct);
        // Set Battery alarm if battery percentatge is below 20%
        this.setCapabilityValue('alarm_battery', parsedBatPct < (this.getSetting('battery_threshold') || 20));
      }
    }

    /* Disabled due to inaccurate reporting
		// temperature reportParser (ID 100)
		if (parsedData.hasOwnProperty('100')) {
			const parsedTemp = parsedData['100'] / 100.0;
			const temperatureOffset = this.getSetting('temperature_offset') || 0;
			this.log('lifeline - temperature', parsedTemp, '+ temperature offset', temperatureOffset);
			this.setCapabilityValue('measure_temperature', parsedTemp + temperatureOffset);
		}

		// humidity reportParser (ID 101)
		if (parsedData.hasOwnProperty('101')) {
			const parsedHum = parsedData['101'] / 100.0;
			this.log('lifeline - humidity', parsedHum);
			this.setCapabilityValue('measure_humidity', parsedHum);
		}
		*/
  }

}

module.exports = XiaomiTempSensor;

// WSDCGQ01LM_sens
/*
Node overview:
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ------------------------------------------
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] Node: 78db4c1a-5cde-4f65-b68c-42ba2832ca3e
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] - Battery: false
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] - Endpoints: 0
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] -- Clusters:
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- zapp
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genBasic
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- 65281 : !�
                                                                     !�!>$d)�e!�
!
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genBasic
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- modelId : lumi.sensor_ht
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genIdentify
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genIdentify
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genGroups
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genGroups
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genScenes
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genScenes
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genMultistateInput
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genMultistateInput
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genOta
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genOta
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- manuSpecificCluster
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : manuSpecificCluster
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] - Endpoints: 1
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] -- Clusters:
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- zapp
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genIdentify
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genIdentify
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genGroups
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genGroups
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genScenes
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genScenes
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genMultistateInput
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genMultistateInput
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] - Endpoints: 2
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] -- Clusters:
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- zapp
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] --- genIdentify
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- cid : genIdentify
2018-03-03 16:56:10 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:11 [log] [ManagerDrivers] [sens] [0] --- genGroups
2018-03-03 16:56:11 [log] [ManagerDrivers] [sens] [0] ---- cid : genGroups
2018-03-03 16:56:11 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:11 [log] [ManagerDrivers] [sens] [0] --- genScenes
2018-03-03 16:56:11 [log] [ManagerDrivers] [sens] [0] ---- cid : genScenes
2018-03-03 16:56:11 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:11 [log] [ManagerDrivers] [sens] [0] --- genAnalogInput
2018-03-03 16:56:11 [log] [ManagerDrivers] [sens] [0] ---- cid : genAnalogInput
2018-03-03 16:56:11 [log] [ManagerDrivers] [sens] [0] ---- sid : attrs
2018-03-03 16:56:11 [log] [ManagerDrivers] [sens] [0] ------------------------------------------

65281 - 0xFF01 report:
{ '1': 3069,		= Battery
  '4': 5117,
  '5': 62,
  '6': 0,
  '10': 0,
  '100': 2045,	= Temperature
  '101': 3837 	= Humidity
}

*/
