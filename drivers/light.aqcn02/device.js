'use strict';

const ZigBeeLightDevice = require('homey-meshdriver').ZigBeeLightDevice;

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
