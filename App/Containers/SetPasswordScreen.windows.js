import React, { Component } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'
import SSH from 'react-native-sshclient'
import { connect } from 'react-redux'
import PasswordInput from '../Components/PasswordInput'
import { setPassword } from '../Services/AzureRestApi'
import NavBar from './NavBar'

// Styles
import styles from './Styles/SetPasswordScreenStyle'

class SetPasswordScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      devicePassword: null,
      updatedPassword: null
    };
  }

  openHome = () => {
    this.props.navigation.navigate('LaunchScreen')
  }

  setPassword = () => {
    if (this.state.devicePassword) {
      const { hub, hubAccessKey, deviceId, deviceDetails, network } = this.props;
      const config = {
        user: deviceDetails.credentials.user,
        host: network.host,
        password: this.state.updatedPassword || deviceDetails.credentials.password
      };
      const command = `echo -e "${this.state.devicePassword}\n${this.state.devicePassword}" | sudo passwd ${deviceDetails.credentials.user}`
      try {
        SSH.Execute(config, command)
          .then(response => {
            setPassword(hub, deviceId, hubAccessKey, deviceDetails.credentials.user, this.state.devicePassword)

            Alert.alert(
              'Set New Password',
              `Password for ${deviceDetails.credentials.user} successfully changed.`,
              [{ text: 'Ok' }]
            )

            const updatedPassword = this.state.devicePassword;
            this.setState({ ...this.state, devicePassword: null, updatedPassword })
          })
          .catch(error => {
            console.log(error)
            Alert.alert(
              'Whoops',
              `There was a problem setting the password for ${deviceDetails.credentials.user}`,
              [{ text: 'Dismiss' }]
            )
          })
      } catch (sshError) {
        console.log(sshError)
        Alert.alert(
          'Whoops',
          `There was a problem setting the password for ${deviceDetails.credentials.user}. Are you connected to the ${network.ssid} network?`,
          [{ text: 'Dismiss' }]
        )
      }
    }
  }

  render() {
    const description = this.props.deviceDetails.description || 'IoT device';
    const hasNetwork = !!this.props.network;

    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <View style={styles.setPasswordContainer}>
          <Text style={styles.instructionText}>
            Your {description}, <Text style={styles.bold}>{this.props.deviceId}</Text>, is ready for use.
          </Text>
          {hasNetwork && <View style={styles.textInputGroup}>
            <Text style={styles.textInputLabel}>Set New Password (Recommended)</Text>
            <PasswordInput inputValue={this.state.devicePassword} disableShow={true}
              onChangeText={(text) => this.setState({ ...this.state, devicePassword: text })} />
          </View>}
        </View>
        <View>
          <View style={styles.navigationContainer}>
            <View style={styles.navigationButtonContainer}>
              <TouchableOpacity style={styles.navigationButton} onPress={this.openHome}>
                <Text style={styles.navigationButtonText}>DONE</Text>
              </TouchableOpacity>
            </View>
            {hasNetwork && <View style={styles.navigationButtonContainer}>
              <TouchableOpacity style={[styles.navigationButton, styles.nextButton]} onPress={this.setPassword}>
                <Text style={styles.navigationButtonText}>SET NEW PASSWORD</Text>
              </TouchableOpacity>
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
    network: ownProps.navigation.state.params.network
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SetPasswordScreen)
