import React, { Component } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { getDeviceTwin } from '../Services/AzureRestApi'
import NavBar from './NavBar'

// Styles
import styles from './Styles/EdgeInstallScreenStyle'

class EdgeInstallScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      installing: true
    };

    setTimeout(this.startInstallCheck, 5000);
  }

  startInstallCheck = () => {
    this.setState({ ...this.state, installing: true }, () => this.checkForInstall())
  }

  checkForInstall = async (command) => {
    const { deviceId, deviceDetails, hub, hubAccessKey, network } = this.props;
    try {
      const deviceInfo = await getDeviceTwin(hub.properties.hostName, deviceId, hubAccessKey);

      if (!deviceInfo || deviceInfo.tags.status !== 'Completed') {
        setTimeout(this.checkForInstall, 5000)
      } else {
        const finishDetails = {
          hub: hub,
          hubAccessKey: hubAccessKey,
          deviceId: deviceId,
          deviceDetails: deviceDetails,
          network: network
        };

        this.setState({ ...this.state, installing: false }, () => {
          this.props.navigation.navigate('CreateAppScreen', finishDetails)
        })
      }
    } catch (error) {
      const description = deviceDetails.description || `IoT device, ${deviceId},`;
      this.setState({ ...this.state, installing: false }, () => {
        Alert.alert(
          'Whoops',
          `There was an issue with installing the IoT Edge runtime on your ${description}.`,
          [{ text: 'Dismiss' }]
        )
      })
    }
  }

  render() {
    const description = this.props.deviceDetails.description || 'IoT device';

    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <View style={styles.edgeInstallContainer}>
          <Text style={styles.instructionText}>
            Your {description}, <Text style={styles.bold}>{this.props.deviceId}</Text>, is now connected to <Text style={styles.bold}>{this.props.network.ssid}</Text>.
            The IoT Edge Runtime is being installed. This may take a few minutes to complete.
          </Text>
        </View>
        <View>
          <View>
            {this.state.installing && <View style={styles.navigationButton}>
              <Text style={[styles.navigationButtonText, { marginRight: 10, fontSize: 16 }]}>Installing IoT Edge Runtime</Text>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>}
          </View>
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
    connectionString: ownProps.navigation.state.params.connectionString,
    network: ownProps.navigation.state.params.network
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EdgeInstallScreen)
