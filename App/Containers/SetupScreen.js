import CryptoJS from 'crypto-js'
import React, { Component } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import ModalPicker from '../Components/ModalPicker'
import NewOrExistingTextInput from '../Components/NewOrExistingTextInput'
import ResourcesActions from '../Redux/ResourcesRedux'
import {
  checkHubNameAvailability,
  createHub,
  createDevice,
  getDevice,
  getDeviceTwin,
  checkResourceGroupNameAvailability,
  createResourceGroup,
  getHubs,
  getResourceGroups,
  getDevices,
  getSubscriptions,
  getIoTHubLocations,
  getHubValidSkus,
  getHubAccessKey,
  updateDeviceTags,
  checkRegistryNameAvailability,
  createContainerRegistry,
  getContainerRegistries,
  getContainerRegistryCredentials,
  getRegistryValidSkus
} from '../Services/AzureRestApi'
import NavBar from './NavBar'

// Styles
import styles from './Styles/SetupScreenStyle'

class SetupScreen extends Component {
  constructor(props) {
    super(props)

    const defaultSubscription = props.subscriptions.length > 0 && props.subscriptions[0].value;
    const subscriptionLocations = defaultSubscription && props.locations[defaultSubscription]
    const defaultLocation = subscriptionLocations && subscriptionLocations.length > 0 && subscriptionLocations[0].name
    const defaultDeviceId = props.deviceDetails && props.deviceDetails.id

    this.state = {
      subscription: defaultSubscription || null,
      resourceGroup: null,
      iotHub: null,
      device: defaultDeviceId || null,
      location: defaultLocation || null,
      isNewHub: true,
      isNewResourceGroup: true,
      isExistingDevice: false,
      isValidHubName: true,
      isValidResourceGroupName: true,
      isValidDeviceId: true,
      registering: false,
      sku: 'F1',
      registry: null,
      isNewRegistry: true,
      registrySku: null,
      loadingResources: false
    }
  }

  componentDidMount = () => {
    if (this.props.subscriptions.length === 0) {
      this.setState({ ...this.state, loadingResources: true }, this.loadResources)
    }
  }

  loadResources = () => {
    getSubscriptions()
      .then(subscriptions => {
        this.props.setSubscriptions(subscriptions)

        if (subscriptions && subscriptions.length > 0) {
          const subscriptionId = subscriptions[0].subscriptionId
          getHubs(subscriptionId).then(hubs => {
            this.props.setIotHubs(subscriptionId, hubs)
          })
          getResourceGroups(subscriptionId).then(resourceGroups => {
            this.props.setResourceGroups(subscriptionId, resourceGroups)
          })
          getIoTHubLocations(subscriptionId).then(locations => {
            this.props.setLocations(subscriptionId, locations)
          })
        }

        this.setState({ ...this.state, loadingResources: false })
      })
  }

  setSubscription = (value) => {
    this.setState({ ...this.state, subscription: value }, () => {
      this.updateLocations(value)
      this.updateHubs(value)
      this.updateResourceGroups(value)
      this.updateRegistries(value)
    })
  }

  updateLocations = (subscriptionId) => {
    getIoTHubLocations(subscriptionId)
      .then(locations => {
        this.props.setLocations(subscriptionId, locations)

        if (locations.length > 0) {
          const match = locations.find(l => l.name === this.state.location)
          if (!match) {
            this.setLocation(locations[0].name)
          }
        }
      })
  }

  setHub = async (value) => {
    this.setState({ ...this.state, iotHub: value }, () => {
      this.updateDevices(this.state.subscription, value)
    })
  }

  setHubMode = (existingMode) => {
    const subscriptionId = this.state.subscription;
    let hub = this.state.iotHub;
    if (existingMode) {
      if (subscriptionId) {
        const subscriptionIotHubs = this.props.iotHubs[subscriptionId]
        if (subscriptionIotHubs) {
          hub = subscriptionIotHubs[0].name;
        }
      }
    } else {
      hub = null;
    }

    this.setState({ ...this.state, isNewHub: !existingMode, iotHub: hub }, () => {
      if (hub !== null) {
        this.updateDevices(subscriptionId, hub)
      }
    })
  }

  setSku = (value) => {
    this.setState({ ...this.state, sku: value })
  }

  updateHubs = (subscriptionId) => {
    getHubs(subscriptionId)
      .then(hubs => {
        this.props.setIotHubs(subscriptionId, hubs)

        if (!this.state.isNewHub && hubs.length > 0) {
          this.setHub(hubs[0].name)
        }
      })
  }

  setResourceGroup = async (value) => {
    this.setState({ ...this.state, resourceGroup: value })
  }

  setResourceGroupMode = (existingMode) => {
    let resourceGroupName = this.state.resourceGroup;
    if (existingMode) {
      const subscriptionId = this.state.subscription;
      if (subscriptionId) {
        const subscriptionResourceGroups = this.props.resourceGroups[subscriptionId]
        if (subscriptionResourceGroups) {
          resourceGroupName = subscriptionResourceGroups[0].name;
        }
      }
    } else {
      resourceGroupName = null
    }

    this.setState({ ...this.state, isNewResourceGroup: !existingMode, resourceGroup: resourceGroupName })
  }

  updateResourceGroups = (subscriptionId) => {
    getResourceGroups(subscriptionId)
      .then(resourceGroups => {
        this.props.setResourceGroups(subscriptionId, resourceGroups)

        if (!this.state.isNewResourceGroup && resourceGroups.length > 0) {
          this.setResourceGroup(resourceGroups[0].name)
        }
      })
  }

  setLocation = async (value) => {
    this.setState({ ...this.state, location: value })
  }

  setDevice = (value) => {
    this.setState({ ...this.state, device: value })
  }

  setDeviceMode = (existingMode) => {
    let deviceName = this.state.device;
    if (existingMode) {
      const iotHub = this.state.iotHub;
      if (iotHub) {
        const iotHubDevices = this.props.devices[iotHub]
        if (iotHubDevices) {
          deviceName = iotHubDevices[0].deviceId;
        }
      }
    } else {
      deviceName = null
    }

    this.setState({ ...this.state, isExistingDevice: existingMode, device: deviceName })
  }

  setRegistry = (value) => {
    this.setState({ ...this.state, registry: value })
  }

  setRegistryMode = (existingMode) => {
    let registry = this.state.registry;
    if (existingMode) {
      const subscription = this.state.subscription;
      if (subscription) {
        const subscriptionRegistries = this.props.registries[subscription]
        if (subscriptionRegistries) {
          registry = subscriptionRegistries[0].name;
        }
      }
    } else {
      registry = null
    }

    this.setState({ ...this.state, isNewRegistry: !existingMode, registry })
  }

  updateRegistries = (subscriptionId) => {
    getContainerRegistries(subscriptionId)
      .then(registries => {
        this.props.setRegistries(subscriptionId, registries)

        if (!this.state.isNewRegistry && registries.length > 0) {
          this.setRegistry(registries[0].name)
        }
      })
  }

  setRegistrySku = (value) => {
    this.setState({ ...this.state, registrySku: value })
  }

  updateDevices = async (subscriptionId, hubName) => {
    if (!this.state.isNewHub) {
      try {
        const hub = this.props.iotHubs[subscriptionId].find(h => h.name === hubName)
        const keys = await getHubAccessKey(subscriptionId, hub.resourcegroup, hubName)
        getDevices(hub.properties.hostName, keys.primaryKey)
          .then(devices => {
            this.props.setDevices(hub.name, devices)

            if (this.state.isExistingDevice && devices.length > 0) {
              this.setDevice(devices[0].deviceId)
            }
          })
      } catch (error) {
        console.log(error)
      }
    }
  }

  getLocationItems = () => {
    const subscriptionId = this.state.subscription;
    if (subscriptionId) {
      const subscriptionLocations = this.props.locations[subscriptionId];
      if (subscriptionLocations) {
        return subscriptionLocations.map(location => {
          return { key: location.name, label: location.displayName, value: location.name }
        })
      }
    }

    return []
  }

  getIotHubItems = () => {
    const subscriptionId = this.state.subscription;
    if (subscriptionId) {
      const subscriptionHubs = this.props.iotHubs[subscriptionId];
      if (subscriptionHubs) {
        return subscriptionHubs.map(hub => {
          return { key: hub.name, label: hub.name, value: hub.name }
        })
      }
    }

    return []
  }

  getResourceGroups = () => {
    const subscriptionId = this.state.subscription;
    if (subscriptionId) {
      const subscriptionResourceGroups = this.props.resourceGroups[subscriptionId];
      if (subscriptionResourceGroups) {
        return subscriptionResourceGroups.map(rg => {
          return { key: rg.name, label: rg.name, value: rg.name }
        })
      }
    }

    return []
  }

  getDevices = () => {
    const iotHub = this.state.iotHub;
    if (iotHub) {
      const iotHubDevices = this.props.devices[iotHub];
      if (iotHubDevices) {
        return iotHubDevices.map(device => {
          return { key: device.deviceId, label: device.deviceId, value: device.deviceId }
        })
      }
    }

    return []
  }

  getRegistries = () => {
    const { subscription } = this.state;
    if (subscription) {
      const registries = this.props.registries[subscription]
      if (registries) {
        return registries.map(registry => {
          return { key: registry.name, label: registry.name, value: registry.name }
        })
      }
    }

    return []
  }

  getIotHub = (hubName) => {
    const subscriptionId = this.state.subscription;
    if (subscriptionId) {
      const subscriptionHubs = this.props.iotHubs[subscriptionId];
      if (subscriptionHubs) {
        return subscriptionHubs.find(hub => hub.name === hubName)
      }
    }
  }

  getResourceGroup = (resourceGroupName) => {
    const subscriptionId = this.state.subscription;
    if (subscriptionId) {
      const subscriptionResourceGroups = this.props.resourceGroups[subscriptionId];
      if (subscriptionResourceGroups) {
        return subscriptionResourceGroups.find(rg => rg.name === resourceGroupName)
      }
    }
  }

  getRegistry = (registryName) => {
    const subscriptionId = this.state.subscription;
    if (subscriptionId) {
      const subscriptionRegistries = this.props.registries[subscriptionId];
      if (subscriptionRegistries) {
        return subscriptionRegistries.find(registry => registry.name === registryName)
      }
    }
  }

  startRegister = () => {
    if (!this.state.iotHub || (this.state.isNewHub && !this.state.resourceGroup) || !this.state.device) {
      Alert.alert(
        'Whoops',
        'Please fill out all the fields.',
        [{ text: 'Dismiss' }]
      )
      return
    }

    const isExistingDevice = this.state.isExistingDevice;
    this.setState({ ...this.state, registering: true }, () => {
      if (isExistingDevice) {
        this.createExistingDevice()
      } else {
        this.createDevice()
      }
    })
  }

  finishRegister = (details) => {
    this.setState({ ...this.state, registering: false }, () => {
      this.openConnectScreen(details)
    })
  }

  registerError = (error) => {
    const errorMessage = error.Code ? `${error.Code} - ${error.Message}` : error
    this.setState({ ...this.state, registering: false }, () => {
      Alert.alert(
        'Whoops',
        `There was a problem setting up ${this.state.device}. Do you have access to the Internet?\n\n${errorMessage}`,
        [{ text: 'Dismiss' }]
      )
    })
  }

  getOrCreateHub = async () => {
    const existingIotHub = this.getIotHub(this.state.iotHub);
    if (!this.state.isNewHub && existingIotHub) {
      return Promise.resolve(existingIotHub);
    }

    const result = await checkHubNameAvailability(this.state.subscription, this.state.iotHub)
    if (result && !result.nameAvailable) {
      return Promise.reject({ Code: 400, Message: 'IoT Hub already exists. Name is not available.' });
    }

    const resourceGroup = await this.getOrCreateResourceGroup()
    return createHub(this.state.subscription, resourceGroup.name, this.state.iotHub, resourceGroup.location, this.state.sku)
  }

  getOrCreateResourceGroup = async () => {
    const existingResourceGroup = this.getResourceGroup(this.state.resourceGroup);
    if (!this.state.isNewResourceGroup && existingResourceGroup) {
      return Promise.resolve(existingResourceGroup);
    }

    const result = await checkResourceGroupNameAvailability(this.state.subscription, this.state.resourceGroup)
    if (result && !result.nameAvailable) {
      return Promise.reject({ Code: 400, Message: 'Resource group already exists. Name is not available.' });
    }

    return createResourceGroup(this.state.subscription, this.state.resourceGroup, this.state.location)
  }

  getOrCreateContainerRegistry = async (resourceGroup, location) => {
    const existingRegistry = this.getRegistry(this.state.registry);
    if (!this.state.isNewRegistry && existingRegistry) {
      return Promise.resolve(existingRegistry);
    }

    const result = await checkRegistryNameAvailability(this.state.subscription, this.state.registry)
    if (result && !result.nameAvailable) {
      return Promise.reject({ Code: 400, Message: 'Container registry already exists. Name is not available.' });
    }

    return createContainerRegistry(this.state.subscription, resourceGroup, this.state.registry, location, this.state.registrySku)
  }

  createDevice = async () => {
    try {
      const { isEdgeDevice } = this.props;
      const hub = await this.getOrCreateHub()
      if (hub && hub.HttpStatusCode && hub.HttpStatusCode === 'BadRequest') {
        this.registerError(hub)
        return
      }

      const hubAccessKey = await getHubAccessKey(hub.subscriptionid, hub.resourcegroup, hub.name)
      let containerRegistryCreds = null;
      if (isEdgeDevice && this.state.registry) {
        const containerRegistry = await this.getOrCreateContainerRegistry(hub.resourcegroup, hub.location)
        containerRegistryCreds = await getContainerRegistryCredentials(containerRegistry.id)
        containerRegistryCreds.name = containerRegistry.name;
      }
      const deviceType = isEdgeDevice ? 'iotedge' : '';
      const existingDevice = await getDevice(hub.properties.hostName, this.state.device, hubAccessKey.primaryKey)
      if (existingDevice.deviceId) {
        Alert.alert(
          'Device Already Exists',
          'A device with the same ID already exists. Do you want to use it?',
          [
            { text: 'No', onPress: () => this.setState({ ...this.state, registering: false }) },
            { text: 'Yes', onPress: () => this.updateDeviceTagsAndFinish(hub, hubAccessKey, existingDevice, containerRegistryCreds) }
          ]
        )
        return;
      }

      const device = await createDevice(hub.properties.hostName, this.state.device, hubAccessKey.primaryKey, deviceType)
      this.updateDeviceTagsAndFinish(hub, hubAccessKey, device, containerRegistryCreds)
    } catch (error) {
      this.registerError(error)
    }
  }

  createExistingDevice = async () => {
    try {
      const { isEdgeDevice } = this.props;
      const hub = this.getIotHub(this.state.iotHub)
      const hubAccessKey = await getHubAccessKey(hub.subscriptionid, hub.resourcegroup, hub.name)
      let containerRegistryCreds = null;
      if (isEdgeDevice && this.state.registry) {
        const containerRegistry = await this.getOrCreateContainerRegistry(hub.resourcegroup, hub.location)
        containerRegistryCreds = await getContainerRegistryCredentials(containerRegistry.id)
        containerRegistryCreds.name = containerRegistry.name;
      }
      const device = await getDevice(hub.properties.hostName, this.state.device, hubAccessKey.primaryKey)
      this.updateDeviceTagsAndFinish(hub, hubAccessKey, device, containerRegistryCreds)
    } catch (error) {
      this.registerError(error)
    }
  }

  getBase64Password = (password) => {
    const wordArray = CryptoJS.enc.Utf8.parse(password);
    return CryptoJS.enc.Base64.stringify(wordArray);
  }

  getSanitizedDetails = () => {
    const sanitizedDetails = JSON.parse(JSON.stringify(this.props.deviceDetails));

    sanitizedDetails.ipAddress = null;
    sanitizedDetails.status = null;

    if (sanitizedDetails.credentials && sanitizedDetails.credentials.password) {
      sanitizedDetails.credentials.password = this.getBase64Password(sanitizedDetails.credentials.password);
    }

    if (sanitizedDetails.accessPoint && sanitizedDetails.accessPoint.passphrase) {
      sanitizedDetails.accessPoint.passphrase = this.getBase64Password(sanitizedDetails.accessPoint.passphrase);
    }

    return sanitizedDetails;
  }

  updateDeviceTagsAndFinish = async (hub, hubAccessKey, device, containerRegistry) => {
    const key = device.authentication.symmetricKey.primaryKey;
    const details = {
      hub: hub,
      hubAccessKey: hubAccessKey.primaryKey,
      deviceId: device.deviceId,
      isEdgeDevice: this.props.isEdgeDevice,
      deviceDetails: this.props.deviceDetails,
      connectionString: `HostName=${hub.properties.hostName};DeviceId=${device.deviceId};SharedAccessKey=${key}`,
      accessKey: key,
      containerRegistry
    };

    await updateDeviceTags(hub.properties.hostName, device.deviceId, hubAccessKey.primaryKey, this.getSanitizedDetails())

    this.setState({ ...this.state, registering: false }, () => {
      this.openConnectScreen(details)
    })
  }

  openConnectScreen = (details) => {
    const nextScreen = details.deviceDetails.isIoTButton ? 'ButtonConfigModeScreen' : 'WifiConnectScreen';
    this.props.navigation.navigate(nextScreen, details)
  }

  render() {
    const { deviceDetails, isEdgeDevice } = this.props;
    const description = deviceDetails.description || 'IoT device';
    const instructionText = `Let's set up your ${description}`;
    const locations = this.getLocationItems();
    const iotHubs = this.getIotHubItems();
    const resourceGroups = this.getResourceGroups();
    const devices = this.getDevices();
    const registries = this.getRegistries();

    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.setupContainer}>
            <Text style={styles.instructionText}>{instructionText}</Text>
            <ModalPicker label="Subscription"
              inputValue={this.state.subscription}
              onValueChange={this.setSubscription}
              items={this.props.subscriptions} />
            <NewOrExistingTextInput label="Create or Select IoT Hub"
              inputValue={this.state.iotHub}
              onValueChange={this.setHub}
              onModeChange={this.setHubMode}
              existingItems={iotHubs} />
            {this.state.isNewHub && <ModalPicker label="SKU"
              inputValue={this.state.sku}
              onValueChange={this.setSku}
              items={this.props.skus} />}
            {this.state.isNewHub && <NewOrExistingTextInput label="Create or Select Resource Group"
              inputValue={this.state.resourceGroup}
              onValueChange={this.setResourceGroup}
              onModeChange={this.setResourceGroupMode}
              existingItems={resourceGroups} />}
            {this.state.isNewHub && this.state.isNewResourceGroup && <ModalPicker label="Location"
              inputValue={this.state.location}
              onValueChange={this.setLocation}
              items={locations} />}
            <NewOrExistingTextInput label="Create or Select Device"
              inputValue={this.state.device}
              onValueChange={this.setDevice}
              onModeChange={this.setDeviceMode}
              existingItems={devices} />
            {isEdgeDevice && <NewOrExistingTextInput label="Create or Select Container Registry"
              inputValue={this.state.registry}
              onValueChange={this.setRegistry}
              onModeChange={this.setRegistryMode}
              existingItems={registries} />}
            {isEdgeDevice && this.state.isNewRegistry && <ModalPicker label="Container Registry SKU"
              inputValue={this.state.registrySku}
              onValueChange={this.setRegistrySku}
              items={this.props.registrySkus} />}
          </View>
        </ScrollView>
        <View>
          {!this.state.loadingResources && !this.state.registering && <View style={styles.navigationContainer}>
            <View style={styles.navigationButtonContainer}>
              <TouchableOpacity style={[styles.navigationButton, styles.nextButton]} onPress={this.startRegister}>
                <Text style={styles.navigationButtonText}>NEXT</Text>
              </TouchableOpacity>
            </View>
          </View>}
          {this.state.registering && <View style={styles.navigationButton}>
            <Text style={[styles.navigationButtonText, { marginRight: 10, fontSize: 16 }]}>Adding Your Device</Text>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>}
          {this.state.loadingResources && <View style={styles.navigationButton}>
            <Text style={styles.instructionText}>Retrieving Your Resources</Text>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>}
        </View>
      </View >
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const subscriptions = state.resources.subscriptions.map(s => {
    return { key: s.subscriptionId, label: s.displayName, value: s.subscriptionId }
  });
  const skus = getHubValidSkus().map(sku => {
    return { key: sku.name, label: `${sku.name} - ${sku.tier}`, value: sku.name }
  })
  const registrySkus = getRegistryValidSkus().map(sku => {
    return { key: sku.name, label: `${sku.name} - ${sku.tier}`, value: sku.name }
  })

  return {
    isEdgeDevice: ownProps.navigation.state.params.isEdgeDevice,
    deviceDetails: ownProps.navigation.state.params.deviceDetails,
    subscriptions,
    resourceGroups: state.resources.resourceGroups,
    iotHubs: state.resources.iotHubs,
    devices: state.resources.devices,
    locations: state.resources.locations,
    skus,
    registries: state.resources.registries,
    registrySkus
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSubscriptions: (subscriptions) => {
      dispatch(ResourcesActions.subscriptionSuccess(subscriptions))
    },
    setLocations: (subscription, locations) => {
      dispatch(ResourcesActions.locationSuccess(subscription, locations))
    },
    setIotHubs: (subscription, iotHubs) => {
      dispatch(ResourcesActions.iotHubSuccess(subscription, iotHubs))
    },
    setResourceGroups: (subscription, resourceGroups) => {
      dispatch(ResourcesActions.resourceGroupSuccess(subscription, resourceGroups))
    },
    setDevices: (iotHub, devices) => {
      dispatch(ResourcesActions.deviceSuccess(iotHub, devices))
    },
    setRegistries: (subscriptionId, registries) => {
      dispatch(ResourcesActions.registrySuccess(subscriptionId, registries))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SetupScreen)
