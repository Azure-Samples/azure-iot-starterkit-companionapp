import React, { Component } from 'react'
import { ActivityIndicator, Alert, ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native'
import SSH from 'react-native-ssh'
import { connect } from 'react-redux'
import PasswordInput from '../Components/PasswordInput'
import { connectButton, getDeviceTwin } from '../Services/AzureRestApi'
import { getConnectScript } from '../Services/Scripts'
import NavBar from './NavBar'

// Styles
import styles from './Styles/WifiConnectScreenStyle'

class WifiConnectScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      connecting: false,
      ssid: null,
      passphrase: ''
    }
  }

  startConnectRest = async () => {
    this.setState({ ...this.state, connecting: true }, () => {
      this.connectIoTButton()
    });
  }

  connectIoTButton = async () => {
    const { ssid, passphrase } = this.state;
    const { hub, deviceDetails, deviceId, accessKey, hubAccessKey } = this.props;
    const accessPoint = deviceDetails.accessPoint;

    try {
      await connectButton(accessPoint.host, ssid, passphrase, hub.properties.hostName, deviceId, accessKey)

      const screenParams = {
        hub: hub,
        hubAccessKey: hubAccessKey,
        deviceId: deviceId,
        deviceDetails: deviceDetails
      };

      this.setState({ ...this.state, connecting: false }, () => {
        this.props.navigation.navigate('ButtonOperatingModeScreen', screenParams)
      })
    } catch (error) {
      const description = deviceDetails.description || `IoT device, ${deviceId},`;
      this.setState({ ...this.state, connecting: false }, () => {
        Alert.alert(
          'Whoops',
          `There was an issue with connecting your ${description} to the network provided. Are you connected to the ${accessPoint.ssid} network?`,
          [{ text: 'Dismiss' }]
        )
      })
    }
  }

  startConnect = () => {
    if (this.state.ssid) {
      const { connectionString, deviceDetails, deviceId, hub, hubAccessKey, containerRegistry } = this.props;
      if (!deviceDetails || !deviceDetails.credentials || !deviceDetails.accessPoint) {
        // redirect to manual entry screen
        return
      }

      const hubConnectionString = `HostName=${hub.properties.hostName};SharedAccessKeyName=iothubowner;SharedAccessKey=${hubAccessKey}`;
      const config = {
        user: deviceDetails.credentials.user,
        host: deviceDetails.accessPoint.host,
        password: deviceDetails.credentials.password
      };
      const registryName = containerRegistry && containerRegistry.name || '';
      const registryUser = containerRegistry && containerRegistry.username || '';
      const registryPass = containerRegistry && containerRegistry.password || '';
      // For Raspberry Pi - need to generalize
      const connectCommand = `
        echo 'sh connect.sh $4 $5' > connect_and_install.sh &&
        echo 'while true; do sleep 5; ping -c1 www.google.com > /dev/null && break; done' >> connect_and_install.sh &&
        echo 'rm sendip_and_install.sh' >> connect_and_install.sh &&
        echo 'sleep 5' >> connect_and_install.sh &&
        echo "wget 'https://iotcompanionapp.blob.core.windows.net/scripts/sendip_and_install.sh'" >> connect_and_install.sh &&
        echo 'sh sendip_and_install.sh $1 $2 $3 $6 $7 $8' >> connect_and_install.sh &&
        sudo bash -c 'sh connect_and_install.sh "${hubConnectionString}" "${deviceId}" "${connectionString}" "${this.state.ssid}" "${this.state.passphrase}" "${registryName}" "${registryUser}" "${registryPass}" </dev/null >connect.log 2>&1 &'
      `;
      this.setState({ ...this.state, connecting: true }, () => {
        this.executeConnectCommand(config, connectCommand)
      });
    }
  }

  executeConnectCommand = async (config, command) => {
    try {
      // check if hostapd configuration exists
      const checkHostapdCommand = '[ -f /etc/hostapd/hostapd.conf ] && echo "hostapd"';
      const response = await SSH.execute(config, checkHostapdCommand);
      const isHostApd = response.length > 0 && response[0] === 'hostapd';

      // generate connect script
      const hasPassphrase = !!this.state.passphrase;
      const connectScript = getConnectScript(isHostApd, hasPassphrase);
      const scriptCommand = `echo '${connectScript}' > connect.sh`;
      await SSH.execute(config, scriptCommand);

      await SSH.execute(config, command)
      this.checkForConnection()
    } catch (error) {
      const { deviceDetails, deviceId } = this.props;
      const description = deviceDetails.description || `IoT device, ${deviceId},`;
      const accessPoint = deviceDetails.accessPoint;
      this.setState({ ...this.state, connecting: false }, () => {
        Alert.alert(
          'Whoops',
          `There was an issue with connecting your ${description} to the network provided. Are you connected to the ${accessPoint.ssid} network?`,
          [{ text: 'Dismiss' }]
        )
      })
    }
  }

  checkForConnection = async () => {
    const { deviceId, hub, hubAccessKey } = this.props;
    try {
      const deviceInfo = await getDeviceTwin(hub.properties.hostName, deviceId, hubAccessKey);

      if (!deviceInfo || deviceInfo.tags.status !== 'Connected') {
        setTimeout(this.checkForConnection, 5000)
      } else {
        this.setState({ ...this.state, connecting: false }, () => {
          const screenParams = {
            hub: this.props.hub,
            hubAccessKey: this.props.hubAccessKey,
            deviceId: this.props.deviceId,
            deviceDetails: this.props.deviceDetails,
            connectionString: this.props.connectionString,
            network: {
              host: deviceInfo.tags.ipAddress,
              ssid: this.state.ssid,
              passphrase: this.state.passphrase
            }
          };

          if (this.props.isEdgeDevice) {
            this.props.navigation.navigate('EdgeInstallScreen', screenParams)
          } else {
            this.props.navigation.navigate('CreateAppScreen', screenParams)
          }
        });
      }
    } catch (error) {
      console.log(error);
      setTimeout(this.checkForConnection, 5000)
    }
  }

  onPasswordChange = (text) => {
    this.setState({ ...this.state, passphrase: text })
  }

  render() {
    const { accessPoint, isIoTButton } = this.props.deviceDetails;
    const description = this.props.deviceDetails.description || `IoT device, ${this.props.deviceId},`;
    const hasPassphrase = accessPoint.passphrase !== '' && accessPoint.passphrase != null;

    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.wifiConnectContainer}>
            <Text style={styles.instructionText}>
              Let's join your {description} to a wireless network with Internet and register it with your IoT Hub. This will take a few minutes.
          </Text>
            {hasPassphrase && <Text style={styles.stepText}>
              1. Connect to the <Text style={styles.bold}>{accessPoint.ssid}</Text> network with the password <Text style={styles.bold}>{accessPoint.passphrase}</Text>. You will need switch over to Wi-Fi settings on your mobile device.
          </Text>}
            {!hasPassphrase && <Text style={styles.stepText}>
              1. Connect to the <Text style={styles.bold}>{accessPoint.ssid}</Text> network (no password required). You will need switch over to Wi-Fi settings on your mobile device.
          </Text>}
            <Text style={styles.stepText}>
              2. Enter the wireless network and passphrase. This will be the network your {description} will use to send messages.
          </Text>
            <View style={styles.textInputGroup}>
              <Text style={styles.textInputLabel}>Wireless Network (SSID)</Text>
              <TextInput underlineColorAndroid="transparent" style={styles.textInputContainer}
                autoCapitalize="none" autoCorrect={false}
                onChangeText={(text) => this.setState({ ...this.state, ssid: text })} />
            </View>
            <View style={styles.textInputGroup}>
              <Text style={styles.textInputLabel}>Wireless Network Password</Text>
              <PasswordInput inputValue={this.state.passphrase}
                onChangeText={this.onPasswordChange} />
            </View>
          </View>
        </ScrollView>
        <View>
          {!this.state.connecting && <View style={styles.navigationContainer}>
            {!isIoTButton && <View style={styles.navigationButtonContainer}>
              <TouchableOpacity style={[styles.navigationButton, styles.nextButton]} onPress={this.startConnect}>
                <Text style={styles.navigationButtonText}>CONNECT</Text>
              </TouchableOpacity>
            </View>}
            {isIoTButton && <View style={styles.navigationButtonContainer}>
              <TouchableOpacity style={[styles.navigationButton, styles.nextButton]} onPress={this.startConnectRest}>
                <Text style={styles.navigationButtonText}>CONNECT</Text>
              </TouchableOpacity>
            </View>}
          </View>}
          {this.state.connecting && <View style={styles.navigationButton}>
            <Text style={[styles.navigationButtonText, { marginRight: 10, fontSize: 16 }]}>Connecting and Preparing Your Device</Text>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>}
        </View>
      </View >
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    hub: ownProps.navigation.state.params.hub,
    hubAccessKey: ownProps.navigation.state.params.hubAccessKey,
    deviceId: ownProps.navigation.state.params.deviceId,
    isEdgeDevice: ownProps.navigation.state.params.isEdgeDevice,
    deviceDetails: ownProps.navigation.state.params.deviceDetails,
    connectionString: ownProps.navigation.state.params.connectionString,
    accessKey: ownProps.navigation.state.params.accessKey,
    containerRegistry: ownProps.navigation.state.params.containerRegistry
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WifiConnectScreen)
