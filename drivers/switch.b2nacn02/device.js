// SDK3 updated & validated: DONE

'use strict';

const Homey = require('homey');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const {
  zclNode, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');

const XiaomiBasicCluster = require('../../lib/XiaomiBasicCluster');

Cluster.addCluster(XiaomiBasicCluster);

class AqaraD1WallSwitchDoubleLN extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // enable debugging
    // this.enableDebug();

    // Enables debug logging in zigbee-clusters
    // debug(true);

    // print the node's info to the console
    // this.printNode();

    const { subDeviceId } = this.getData();

    let onOffEndpoint = 1;
    if (subDeviceId === 'rightSwitch') onOffEndpoint = 2;

    // Register capabilities and reportListeners for Left or Right switch
    if (this.hasCapability('onoff')) {
      this.debug('Register OnOff capability:', subDeviceId, onOffEndpoint);
      this.registerCapability('onoff', CLUSTER.ON_OFF, {
        endpoint: onOffEndpoint,
      });
    }

    // measure_power switch
    // applicationType : 589824 = 0x090000 Power in Watts
    // Register measure_power capability

    // measure_power
    if (this.hasCapability('measure_power')) {
      // Define acPower parsing factor based on device settings
      if (typeof this.activePowerFactor !== 'number') {
        const { acPowerMultiplier, acPowerDivisor } = await zclNode.endpoints[this.getClusterEndpoint(CLUSTER.ELECTRICAL_MEASUREMENT)].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].readAttributes('acPowerMultiplier', 'acPowerDivisor');
        this.activePowerFactor = acPowerMultiplier / acPowerDivisor;
        this.debug('activePowerFactor:', acPowerMultiplier, acPowerDivisor, this.activePowerFactor);
      }

      this.registerCapability('measure_power', CLUSTER.ELECTRICAL_MEASUREMENT, {
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 0, // No minimum reporting interval
            maxInterval: 300, // Maximally every ~16 hours
            minChange: 1 / this.activePowerFactor, // Report when value changed by 5
          },
        },
        endpoint: this.getClusterEndpoint(CLUSTER.ELECTRICAL_MEASUREMENT),
      });
    }

    if (this.hasCapability('meter_power')) {
      // Define acPower parsing factor based on device settings
      if (typeof this.meteringFactor !== 'number') {
        const { multiplier, divisor } = await zclNode.endpoints[this.getClusterEndpoint(CLUSTER.METERING)].clusters[CLUSTER.METERING.NAME].readAttributes('multiplier', 'divisor');
        this.meteringFactor = multiplier / divisor;
        this.debug('meteringFactor:', multiplier, divisor, this.meteringFactor);
      }

      this.registerCapability('meter_power', CLUSTER.METERING, {
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 0, // No minimum reporting interval
            maxInterval: 3600, // Maximally every ~16 hours
            minChange: 0.01 / this.meteringFactor, // Report when value changed by 5
          },
        },
        endpoint: this.getClusterEndpoint(CLUSTER.METERING),
      });
    }

    // Register the AttributeReportListener - Lifeline

    // zclNode.endpoints[1].clusters[XiaomiBasicCluster.NAME]
    //  .on('attr.xiaomiLifeline', this.onXiaomiLifelineAttributeReport.bind(this));
  }

  /**
   * This is Xiaomi's custom lifeline attribute, it contains a lot of data, af which the most
   * interesting the battery level. The battery level divided by 1000 represents the battery
   * voltage. If the battery voltage drops below 2600 (2.6V) we assume it is almost empty, based
   * on the battery voltage curve of a CR1632.
   * @param {{batteryLevel: number}} lifeline
   */
  onXiaomiLifelineAttributeReport({
    state, state1,
  } = {}) {
    this.log('lifeline attribute report', {
      state, state1,
    });

    if (typeof state === 'number') {
      this.setCapabilityValue('onoff', state === 1);
    }

    if (typeof state1 === 'number') {
      this.setCapabilityValue('onoff.1', state1 === 1);
    }
  }

}

module.exports = AqaraD1WallSwitchDoubleLN;

/*
Product ID: QBKG12LM
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ------------------------------------------
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] Node: 1466ceaa-ceca-4a03-b088-f2ed973982d5
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] - Battery: false
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] - Endpoints: 0
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] -- Clusters:
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- zapp
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genBasic
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- 65281 : de(�9�9��$:!�!'	!
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genBasic
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- zclVersion : 1
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- appVersion : 31
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- stackVersion : 2
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- hwVersion : 18
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- manufacturerName : LUMI
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- modelId : lumi.ctrl_ln2.aq1
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- dateCode : 10-12-2017
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- powerSource : 1
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genPowerCfg
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genPowerCfg
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- mainsVoltage : 2240
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genDeviceTempCfg
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genDeviceTempCfg
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- currentTemperature : 22
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genIdentify
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genIdentify
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- identifyTime : 0
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genGroups
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genGroups
2018-05-16 22:26:49 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- nameSupport : 128
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genScenes
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genScenes
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- count : 0
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- currentScene : 0
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- currentGroup : 0
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sceneValid : 0
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- nameSupport : 0
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- lastCfgBy : 0xffffffffffffffff
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genOnOff
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- 61440 : 117440737
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genOnOff
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- onOff : 0
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genTime
2018-05-16 22:26:50 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genTime
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genBinaryOutput
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genBinaryOutput
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- outOfService : 0
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- presentValue : 0
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- statusFlags : 0
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genOta
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genOta
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:51 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] - Endpoints: 1
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] -- Clusters:
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- zapp
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genOnOff
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- 61440 : 117440743
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genOnOff
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- onOff : 0
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genBinaryOutput
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genBinaryOutput
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- outOfService : 0
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- presentValue : 0
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- statusFlags : 0
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] - Endpoints: 2
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] -- Clusters:
2018-05-16 22:26:52 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- zapp
2018-05-16 22:26:53 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genGroups
2018-05-16 22:26:53 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genGroups
2018-05-16 22:26:53 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:53 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genAnalogInput
2018-05-16 22:26:53 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- 261 : 0
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- 262 : 0
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genAnalogInput
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- outOfService : 0
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- presentValue : 0
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- statusFlags : 0
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- applicationType : 589824
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] - Endpoints: 3
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] -- Clusters:
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- zapp
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genAnalogInput
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- 261 : 0
2018-05-16 22:26:54 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- 262 : 0
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genAnalogInput
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- outOfService : 0
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- presentValue : 0.0006293333135545254
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- statusFlags : 0
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- applicationType : 720896
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] - Endpoints: 4
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] -- Clusters:
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- zapp
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genBinaryOutput
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genBinaryOutput
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- outOfService : 0
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- presentValue : 0
2018-05-16 22:26:55 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- statusFlags : 0
2018-05-16 22:26:56 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genMultistateInput
2018-05-16 22:26:56 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genMultistateInput
2018-05-16 22:26:56 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:56 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- numberOfStates : 6
2018-05-16 22:26:56 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- outOfService : 0
2018-05-16 22:26:56 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- presentValue : 1
2018-05-16 22:26:56 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- statusFlags : 0
2018-05-16 22:26:56 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] - Endpoints: 5
2018-05-16 22:26:56 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] -- Clusters:
2018-05-16 22:26:57 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- zapp
2018-05-16 22:26:57 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genBinaryOutput
2018-05-16 22:26:57 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genBinaryOutput
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- outOfService : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- presentValue : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- statusFlags : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genMultistateInput
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genMultistateInput
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- numberOfStates : 6
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- outOfService : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- presentValue : 1
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- statusFlags : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] - Endpoints: 6
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] -- Clusters:
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- zapp
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genBinaryOutput
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genBinaryOutput
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- outOfService : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- presentValue : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- statusFlags : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] --- genMultistateInput
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- cid : genMultistateInput
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- sid : attrs
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- numberOfStates : 6
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- outOfService : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- presentValue : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ---- statusFlags : 0
2018-05-16 22:26:58 [log] [ManagerDrivers] [ctrl_ln2.aq1] [0] ------------------------------------------
*/