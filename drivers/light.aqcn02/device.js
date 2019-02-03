'use strict';

const ZigBeeXYLightDevice = require('homey-meshdriver').ZigBeeXYLightDevice;

class AqaraTunableBulb extends ZigBeeXYLightDevice {

	async onMeshInit() {

      await super.onMeshInit();
      // enable debugging
      this.enableDebug();

      // print the node's info to the console
      this.printNode();
	}

}

module.exports = AqaraTunableBulb;
