// lifeline validated

'use strict';

const { ZigBeeDevice } = require('homey-meshdriver');
const util = require('./../../lib/util');

class AqaraDoorWindowSensor extends ZigBeeDevice {

  onMeshInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // Link util parseData method to this devices instance
    this.parseData = util.parseData.bind(this);

    // Listen for attribute changes on the genOnOff cluster
    this.registerAttrReportListener('genOnOff', 'onOff', 1, 60, null,
      this.onContactReport.bind(this), 0)
      .catch(err => {
        // Registering attr reporting failed
        this.error('failed to register attr report listener - genOnOff - Contact', err);
      });

    // Register the AttributeReportListener - Lifeline
    this.registerAttrReportListener('genBasic', '65281', 1, 60, null,
      this.onLifelineReport.bind(this), 0)
      .catch(err => {
        // Registering attr reporting failed
        this.error('failed to register attr report listener - genBasic - Lifeline', err);
      });
  }

  onContactReport(data) {
    const reverseAlarmLogic = this.getSetting('reverse_contact_alarm') || false;
    const parsedData = !reverseAlarmLogic ? data === 1 : data === 0;
    this.log(`alarm_contact -> ${parsedData}`);
    this.setCapabilityValue('alarm_contact', parsedData);
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

    // contact alarm reportParser (ID 100)
    if (parsedData.hasOwnProperty('100')) {
      const reverseAlarmLogic = this.getSetting('reverse_contact_alarm') || false;
      const parsedContact = !reverseAlarmLogic ? (parsedData['100'] === 1) : (parsedData['100'] === 0);
      this.log('lifeline - contact alarm', parsedContact);
      this.setCapabilityValue('alarm_contact', parsedContact);
    }
  }

}

module.exports = AqaraDoorWindowSensor;

// MCCGQ11LM_sensor_magnet
/*
Node overview:
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ------------------------------------------
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] Node: 838816d1-66b1-4a2e-a9da-b4758ae6f2db
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] - Battery: false
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] - Endpoints: 0
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] -- Clusters:
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] --- zapp
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] --- genBasic
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- 65281 : !�
                                                                                  (!�!&$
!d
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- cid : genBasic
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- sid : attrs
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- modelId : lumi.sensor_magnet.aq2
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] --- genIdentify
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- cid : genIdentify
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- sid : attrs
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] --- genGroups
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- cid : genGroups
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- sid : attrs
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] --- genOnOff
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- cid : genOnOff
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- sid : attrs
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- onOff : 1
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] --- manuSpecificCluster
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- cid : manuSpecificCluster
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ---- sid : attrs
2018-03-03 15:04:39 [log] [ManagerDrivers] [sensor_magnet.aq2] [0] ------------------------------------------

65281 - 0xFF01 report:
{ '1': 3069,	=	Battery
  '3': 29,		= soc_temperature
  '4': 5117,
  '5': 38,
  '6': 65550,
  '10': 0,
  '100': 1 		= contact alarm (on / off)
}

*/
