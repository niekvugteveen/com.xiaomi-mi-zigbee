'use strict';

const { Cluster, ZCLDataTypes, ZCLDataType } = require('zigbee-clusters');

const AQARA_ATTRIBUTES = {
  1: { name: 'batteryVoltage' }, // type: ZCLDataTypes.uint16
  3: { name: 'cpuTemperature' }, // type: ZCLDataTypes.int8
  // 4: { name: 'unknown_4' }, // type: ZCLDataTypes.uint16
  5: { name: 'rssi' }, // type: ZCLDataTypes.uint16
  6: { name: 'txCount' }, // type: ZCLDataTypes.uint40
  // 8: { name: 'unknown_8' }, // type: ZCLDataTypes.uint16
  // 10: { name: 'unknown_10' }, // type: ZCLDataTypes.uint16
  // 11: { name: 'humidity' }, // type: ZCLDataTypes.uint16
  100: { name: 'state' }, // type: ZCLDataTypes.uint32, this can be on/off, temperature, etc.
  // 101: { name: 'state1' }, // ZCLDataTypes.uint16
  // 102: { name: 'pressure' }, // type: ZCLDataTypes.uint16

  // TODO: these are currently unknown or not used
  // 149: { name: 'consumption' },
  // 150: { name: 'voltage' },
  // 151: { name: 'unknown_151' },
  // 152: { name: 'power' },
  // 153: { name: 'unknown_153' },
  // 154: { name: 'unknown_154' },
};

/**
 * This is a custom data type used by Xiaomi to report various "attributes" in a single attribute
 * value. All possible "attributes" are listed in {@link AQARA_ATTRIBUTES}. The buffer is
 * parsed by looking for the "attribute" ids (first byte), data type of the "attribute" (second
 * byte), and the value (which is parsed based on the data type).
 */
const AqaraLifelineDataRecord = new ZCLDataType(
  NaN,
  'AqaraLifelineDataRecord',
  -3,
  () => { // to buffer
    throw new Error('Not implemented');
  },
  ((buf, i, returnLength) => { // from buffer
    i = i || 0;
    const startByte = i;
    const result = {};

    // Read the attribute id of this custom attribute-in-an-attribute (first byte)
    result.id = ZCLDataTypes.uint8.fromBuffer(buf, i);
    i += ZCLDataTypes.uint8.length;

    // Read the ZCL data type of this custom attribute-in-an-attribute (second byte)
    const dataTypeId = ZCLDataTypes.uint8.fromBuffer(buf, i);
    i += ZCLDataTypes.uint8.length;

    // Try to find an existing DataType based on the `dataTypeId`, first check the
    // `AQARA_ATTRIBUTES` if a type is specified, second, search the `ZCLDataTypes` for a
    // DataType with id = `dataTypeId`.
    const DataType = (AQARA_ATTRIBUTES[result.id] && AQARA_ATTRIBUTES[result.id].type) || Object.values(ZCLDataTypes).find(type => type && type.id === dataTypeId);

    // Abort if no valid data type was found
    if (!DataType) throw new TypeError(`Invalid type for attribute: ${result.id}`);

    // eslint-disable-next-line no-mixed-operators
    result.name = (AQARA_ATTRIBUTES[result.id] && AQARA_ATTRIBUTES[result.id].name) || `unknown_attr_${result.id}`;

    // Parse the value from the buffer using the DataType
    const entry = DataType.fromBuffer(buf, i, true);
    if (DataType.length > 0) {
      i += DataType.length;
      result.value = entry;
    } else {
      result.value = entry.result;
      i += entry.length;
    }
    if (returnLength) {
      return { result, length: i - startByte };
    }
    return result;
  }),
);

/**
 * This data type represents an array of {@link AqaraLifelineDataRecordArray} structs.
 */
const AqaraLifelineDataRecordArray = new ZCLDataType(
  NaN,
  'AqaraLifelineDataRecordArray',
  -1,
  () => { // to buffer
    throw new Error('Not implemented');
  },
  ((buf, i, returnLength) => { // from buffer
    // eslint-disable-next-line prefer-const
    let { result, length } = ZCLDataTypes.buffer8.fromBuffer(buf, i, true);

    // Parse the buffer for multiple `AqaraLifelineDataRecord`
    result = ZCLDataTypes.Array0(AqaraLifelineDataRecord).fromBuffer(result, 0);
    result = result.reduce((r, { name, value }) => Object.assign(r, { [name]: value }), {});
    if (returnLength) {
      return { result, length };
    }
    return result;
  }),
);

const ATTRIBUTES = {
  mode: {
    id: 9,
    type: ZCLDataTypes.uint8,
    manufacturerId: 0x115f,
  },
  switchType: {
    id: 10,
    type: ZCLDataTypes.uint8,
    manufacturerId: 0x115f,
  },
  aqaraLifeline: {
    id: 247,
    type: AqaraLifelineDataRecordArray,
    manufacturerId: 0x115f,
  },
  powerOffMemory: {
    id: 513,
    type: ZCLDataTypes.bool,
    manufacturerId: 0x115f,
  },
};

const COMMANDS = {
};

class AqaraManufacturerSpecificCluster extends Cluster {

  static get ID() {
    return 64704; // 0xFCC0
  }

  static get NAME() {
    return 'AqaraManufacturerSpecific';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(AqaraManufacturerSpecificCluster);

module.exports = AqaraManufacturerSpecificCluster;