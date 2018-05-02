import React, { Component } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import SimpleButton from '../Components/SimpleButton'
import {
  createStorageAccount,
  createAppServicePlan,
  createFunctionApp,
  createSourceControl,
  createFunction
} from '../Services/AzureRestApi'
import NavBar from './NavBar'

// Styles
import styles from './Styles/CreateAppScreenStyle'

class CreateAppScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      creatingApp: false
    };
  }

  startDeployFunction = () => {
    if (!this.state.creatingApp) {
      this.setState({ ...this.state, creatingApp: true }, this.deployAzureFunction)
    }
  }

  generateUniqueName = (hubName) => {
    const randomAlphaNum = Math.random().toString(36).slice(2, 8);
    return `${hubName}${randomAlphaNum}`;
  }

  deployAzureFunction = async () => {
    const { hub } = this.props;
    const subscriptionId = hub.subscriptionid;
    const resourceGroup = hub.resourcegroup;
    const functionName = 'clicklogger';
    const hubName = hub.name;
    const randomizedName = this.generateUniqueName(hubName);
    const location = hub.location;
    const hubConnectionString = this.getIotHubConnectionString();
    const eventsConnectionString = this.getEventHubsConnectionString();
    const storageAccountName = `${randomizedName}`.toLowerCase().replace(/(\W|[_])/g, '');
    const planName = `${randomizedName}plan`;
    const appName = `${randomizedName}app`;

    try {
      const storageKeys = await createStorageAccount(subscriptionId, resourceGroup, storageAccountName, location)
      const primaryKey = storageKeys.keys && storageKeys.keys.length > 0 && storageKeys.keys[0].value;
      const storageAccountConnectionString = this.getStorageAccountConnectionString(storageAccountName, primaryKey)
      const plan = await createAppServicePlan(subscriptionId, resourceGroup, planName, location)
      const app = await createFunctionApp(subscriptionId, resourceGroup, appName, location, plan.id, storageAccountConnectionString, hubConnectionString, eventsConnectionString)
      const sourceControl = await createSourceControl(subscriptionId, resourceGroup, appName)
      const azureFunction = await createFunction(subscriptionId, resourceGroup, appName, functionName, hubName)

      this.setState({ ...this.state, creatingApp: false }, this.openFinalScreen)
    } catch (error) {
      const errorMessage = error.message ? error.message : error
      this.setState({ ...this.state, creatingApp: false }, () => {
        Alert.alert(
          'Whoops',
          `There was a problem creating the Azure Function. Does your mobile device have an Internet connection?\n\n${errorMessage}. `,
          [{ text: 'Dismiss' }]
        )
      })
    }
  }

  getIotHubConnectionString = () => {
    const hostName = this.props.hub.properties.hostName;
    const accessKey = this.props.hubAccessKey;
    return `HostName=${hostName};SharedAccessKeyName=iothubowner;SharedAccessKey=${accessKey}`;
  }

  getEventHubsConnectionString = () => {
    const endpoint = this.props.hub.properties.eventHubEndpoints.events.endpoint;
    const accessKey = this.props.hubAccessKey;
    return `Endpoint=${endpoint};SharedAccessKeyName=iothubowner;SharedAccessKey=${accessKey}`
  }

  getStorageAccountConnectionString = (storageAccountName, primaryKey) => {
    return `DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${primaryKey};EndpointSuffix=core.windows.net`;
  }

  openFinalScreen = () => {
    const finishDetails = {
      hub: this.props.hub,
      deviceId: this.props.deviceId,
      deviceDetails: this.props.deviceDetails,
      network: this.props.network,
      hubAccessKey: this.props.hubAccessKey
    };
    this.props.navigation.navigate('SetPasswordScreen', finishDetails)
  }

  render() {
    const description = this.props.deviceDetails.description || `IoT device, ${this.props.deviceId}`;
    const isIoTButton = this.props.deviceDetails.isIoTButton;

    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <View style={styles.createAppContainer}>
          {isIoTButton && <Text style={styles.instructionText}>
            Your IoT button is now ready for use. You can create an Azure Function to receive messages or we can deploy an example Azure Function for you.
          </Text>}
          {!this.state.creatingApp && <View>
            <Text style={styles.instructionText}>
              Would you like to deploy an example Azure Function for your {description}? Please note that you may incur charges for any provisioned resources.
            </Text>
            <SimpleButton style={styles.yesButton} text='Yes' onPress={this.startDeployFunction} />
            <SimpleButton style={styles.noButton} text='No' onPress={this.openFinalScreen} />
          </View>}
          {this.state.creatingApp && <View>
            <Text style={styles.instructionText}>This will take a few minutes to complete. We are creating the following resources for you:</Text>
            <Text style={styles.stepText}>General Purpose v1 Storage Account</Text>
            <Text style={styles.stepText}>Standard App Service Plan</Text>
            <Text style={styles.stepText}>Function App with Example Function</Text>
          </View>}
        </View>
        <View>
          {this.state.creatingApp && <View style={styles.navigationButton}>
            <Text style={[styles.navigationButtonText, { marginRight: 10, fontSize: 16 }]}>Deploying Azure Function</Text>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>}
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    hub: ownProps.navigation.state.params.hub,
    hubAccessKey: ownProps.navigation.state.params.hubAccessKey,
    deviceId: ownProps.navigation.state.params.deviceId,
    deviceDetails: ownProps.navigation.state.params.deviceDetails,
    network: ownProps.navigation.state.params.network
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateAppScreen)
