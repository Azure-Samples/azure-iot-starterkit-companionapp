import React, { Component } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { getDeviceTwin } from '../Services/AzureRestApi'
import NavBar from './NavBar'

// Styles
import styles from './Styles/ButtonOperatingModeScreenStyle'

class ButtonOperatingModeScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      connecting: false,
      retries: 0
    };
  }

  startConnectCheck = () => {
    this.setState({ ...this.state, connecting: true, retries: 0 }, () => this.checkForConnection())
  }

  checkForConnection = async () => {
    const { hub, deviceDetails, deviceId, hubAccessKey } = this.props;

    if (this.state.retries >= 20) {
      this.setState({ ...this.state, connecting: false }, () => {
        const description = deviceDetails.description || `IoT device, ${deviceId},`;
        Alert.alert(
          'Whoops',
          `Your ${description} was unable to connect to the wireless network you provided. Do you want to try again?`,
          [
            { text: 'No', onPress: () => this.openHome() },
            { text: 'Yes', onPress: () => this.retryWifiConnect() }
          ]
        )
      })

      return
    }

    try {
      const deviceInfo = await getDeviceTwin(hub.properties.hostName, deviceId, hubAccessKey);

      if (!deviceInfo || deviceInfo.properties.reported.health === undefined) {
        this.setState({ ...this.state, retries: this.state.retries + 1 }, () => {
          setTimeout(this.checkForConnection, 5000)
        })
      } else {
        this.setState({ ...this.state, connecting: false }, this.openCreateApp)
      }
    } catch (error) {
      console.log(error)
      this.setState({ ...this.state, connecting: false }, () => {
        const description = deviceDetails.description || `IoT device, ${deviceId}`;
        Alert.alert(
          'Whoops',
          `There was an issue getting the connection status of your ${description}. Are you connected to the Internet?`,
          [{ text: 'Dismiss' }]
        )
      })
    }
  }

  openCreateApp = () => {
    const { hub, deviceDetails, deviceId, hubAccessKey } = this.props;
    const screenParams = {
      hub: hub,
      hubAccessKey: hubAccessKey,
      deviceId: deviceId,
      deviceDetails: deviceDetails
    };

    this.props.navigation.navigate('CreateAppScreen', screenParams)
  }

  openHome = () => {
    this.setState({ ...this.state, connecting: false, retries: 0 }, () => {
      this.props.navigation.navigate('LaunchScreen')
    })
  }

  retryWifiConnect = () => {
    Alert.alert(
      'Enable Config Mode',
      'Please put your button into configuration mode by holding down the button until the LED is blinking yellow. When the LED is blinking red, it will be in configuration mode.',
      [{ text: 'Ok, got it', onPress: () => this.props.navigation.goBack() }]
    )
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <View style={styles.buttonOpModeContainer}>
          <Text style={styles.instructionText}>
            Click and hold the button for 2 seconds. The LED will blink green. Click NEXT when finished.
          </Text>
          <Text style={styles.instructionText}>
            It may take a couple minutes to verify your button is connected.
          </Text>
        </View>
        <View>
          {!this.state.connecting && <View style={styles.navigationContainer}>
            <View style={styles.navigationButtonContainer}>
              <TouchableOpacity style={[styles.navigationButton, styles.nextButton]} onPress={this.startConnectCheck}>
                <Text style={styles.navigationButtonText}>NEXT</Text>
              </TouchableOpacity>
            </View>
          </View>}
          {this.state.connecting && <View style={styles.navigationButton}>
            <Text style={[styles.navigationButtonText, { marginRight: 10, fontSize: 16 }]}>Verifying Your Device Status</Text>
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
    deviceDetails: ownProps.navigation.state.params.deviceDetails
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ButtonOperatingModeScreen)
