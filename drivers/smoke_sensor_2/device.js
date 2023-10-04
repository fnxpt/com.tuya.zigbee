'use strict';

const { CLUSTER } = require("zigbee-clusters");
const { ZigBeeDevice } = require("homey-zigbeedriver");

class smoke_sensor_2 extends ZigBeeDevice {

	async onNodeInit({zclNode}) {

      this.log("Smoke Sensor 2");
      this.printNode();

      if (this.isFirstInit()){
        await this.configureAttributeReporting([
          {
            endpointId: 1,
            cluster: CLUSTER.POWER_CONFIGURATION,
            attributeName: 'batteryPercentageRemaining',
            minInterval: 6600,
            maxInterval: 7200,
            minChange: 1,
          }
        ]);
      }

      zclNode.endpoints[1].clusters[CLUSTER.IAS_ZONE.NAME].onZoneStatusChangeNotification = payload => {
        this.onIASZoneStatusChangeNotification(payload);
      }

      zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME]
      .on('attr.batteryPercentageRemaining', this.onBatteryPercentageRemainingAttributeReport.bind(this));

    }
    onIASZoneStatusChangeNotification({zoneStatus, extendedStatus, zoneId, delay,}) {
      this.log('IASZoneStatusChangeNotification received:', zoneStatus, extendedStatus, zoneId, delay);
      this.setCapabilityValue('alarm_smoke', zoneStatus.alarm1).catch(this.error);
      // this.setCapabilityValue('alarm_battery', zoneStatus.battery).catch(this.error);
      // this.setCapabilityValue('measure_battery', batteryPercentageRemaining/2).catch(this.error);
    }

    onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining) {
      const batteryThreshold = this.getSetting('batteryThreshold') || 20;
      this.log("measure_battery | powerConfiguration - batteryPercentageRemaining (%): ", batteryPercentageRemaining/2);
      this.setCapabilityValue('measure_battery', batteryPercentageRemaining/2).catch(this.error);
      this.setCapabilityValue('alarm_battery', (batteryPercentageRemaining/2 < batteryThreshold) ? true : false).catch(this.error);
    }

    onDeleted(){
		  this.log("Smoke Sensor removed")
	  }


}

module.exports = smoke_sensor_2;