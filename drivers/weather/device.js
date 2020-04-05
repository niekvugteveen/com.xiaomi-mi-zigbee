// lifeline validated

'use strict';

const { ZigBeeDevice } = require('homey-meshdriver');
const util = require('./../../lib/util');

class AqaraWeatherSensor extends ZigBeeDevice {

  onMeshInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // Link util parseData method to this devices instance
    this.parseData = util.parseData.bind(this);

    // Register the AttributeReportListener
    this.registerAttrReportListener('msTemperatureMeasurement', 'measuredValue', 1, 60, null,
      this.onTemperatureReport.bind(this), 0)
      .catch(err => {
        // Registering attr reporting failed
        this.error('failed to register attr report listener - msTemperatureMeasurement', err);
      });

    // Register the AttributeReportListener
    this.registerAttrReportListener('msRelativeHumidity', 'measuredValue', 1, 60, null,
      this.onHumidityReport.bind(this), 0)
      .catch(err => {
        // Registering attr reporting failed
        this.error('failed to register attr report listener - msRelativeHumidity', err);
      });

    // Register the AttributeReportListener
    this.registerAttrReportListener('msPressureMeasurement', '16', 1, 60, null,
      this.onPressureReport.bind(this), 0)
      .catch(err => {
        // Registering attr reporting failed
        this.error('failed to register attr report listener - msPressureMeasurement', err);
      });

    // Register the AttributeReportListener - Lifeline
    this.registerAttrReportListener('genBasic', '65281', 1, 60, null,
      this.onLifelineReport.bind(this), 0)
      .catch(err => {
        // Registering attr reporting failed
        this.error('failed to register attr report listener - genBasic - Lifeline', err);
      });
  }

  onTemperatureReport(value) {
    const parsedValue = this.getSetting('temperature_decimals') === '2' ? Math.round((value / 100) * 100) / 100 : Math.round((value / 100) * 10) / 10;
    if (parsedValue !== -100) {
      // const parsedValue = Math.round((value / 100) * 10) / 10;
      const temperatureOffset = this.getSetting('temperature_offset') || 0;
      this.log('measure_temperature | msTemperatureMeasurement - measuredValue (temperature):', parsedValue, '+ temperature offset', temperatureOffset);
      this.setCapabilityValue('measure_temperature', parsedValue + temperatureOffset);
    }
  }

  onHumidityReport(value) {
    const humidityOffset = this.getSetting('humidity_offset') || 0;
    const parsedValue = this.getSetting('humidity_decimals') === '2' ? Math.round((value / 100) * 100) / 100 : Math.round((value / 100) * 10) / 10;
    this.log('measure_humidity | msRelativeHumidity - measuredValue (humidity):', parsedValue, '+ humidity offset', humidityOffset);
    this.setCapabilityValue('measure_humidity', parsedValue + humidityOffset);
  }

  onPressureReport(value) {
    const pressureOffset = this.getSetting('pressure_offset') || 0;
    const parsedValue = Math.round((value / 100) * 10);
    this.log('measure_pressure | msPressureMeasurement - 16 (pressure):', parsedValue, '+ pressure offset', pressureOffset);
    this.setCapabilityValue('measure_pressure', parsedValue + pressureOffset);
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

		// pressure reportParser (ID 102) - reported number not reliable
		*/
  }

}

module.exports = AqaraWeatherSensor;

// WSDCGQ11LM_weather

/*
Node overview:
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] ------------------------------------------
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] Node: 6364d680-e95a-4276-89eb-39f1a614f1e1
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] - Battery: false
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] - Endpoints: 0
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] -- Clusters:
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] --- zapp
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] --- genBasic
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] ---- 65281 : !�
f+��                                                                    !�!<$d)
!
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] ---- cid : genBasic
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] ---- sid : attrs
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] ---- modelId : lumi.weather
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] --- genIdentify
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] ---- cid : genIdentify
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] ---- sid : attrs
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] --- genGroups
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] ---- cid : genGroups
2018-03-03 15:04:39 [log] [ManagerDrivers] [weather] [0] ---- sid : attrs
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] --- msTemperatureMeasurement
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- cid : msTemperatureMeasurement
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- sid : attrs
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- measuredValue : 2061
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] --- msPressureMeasurement
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- 16 : 9947
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- 20 : -1
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- cid : msPressureMeasurement
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- sid : attrs
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- measuredValue : 994
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] --- msRelativeHumidity
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- cid : msRelativeHumidity
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- sid : attrs
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- measuredValue : 3485
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] --- manuSpecificCluster
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- cid : manuSpecificCluster
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ---- sid : attrs
2018-03-03 15:04:40 [log] [ManagerDrivers] [weather] [0] ------------------------------------------

65281 - 0xFF01 report:
{ '1': 3069,		= Battery voltage
  '4': 5117,
  '5': 61,
  '6': 1,
  '10': 0,
  '100': 2094,	= temperature
  '101': 3676,	= humidity
  '102': 130557 = pressure - reported number not reliable
}
*/
