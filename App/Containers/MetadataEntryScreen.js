import React, { Component } from 'react'
import { Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import PasswordInput from '../Components/PasswordInput'
import NavBar from './NavBar'

// Styles
import styles from './Styles/MetadataEntryScreenStyle'

class MetadataEntryScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      credentials: {},
      accessPoint: {
        ssid: '',
        passphrase: '',
        host: ''
      },
      isIoTButton: false
    }
  }

  setAccessPointHost = (host) => {
    const accessPoint = { ...this.state.accessPoint, host }
    this.setState({ ...this.state, accessPoint })
  }

  setAccessPointSSID = (ssid) => {
    const accessPoint = { ...this.state.accessPoint, ssid }
    this.setState({ ...this.state, accessPoint })
  }

  setAccessPointPassphrase = (passphrase) => {
    const accessPoint = { ...this.state.accessPoint, passphrase: passphrase || '' }
    this.setState({ ...this.state, accessPoint })
  }

  setIotButton = (value) => {
    this.setState({ ...this.state, isIoTButton: value })
  }

  setCredentialsUser = (user) => {
    const credentials = { ...this.state.credentials, user }
    this.setState({ ...this.state, credentials })
  }

  setCredentialsPassword = (password) => {
    const credentials = { ...this.state.credentials, password }
    this.setState({ ...this.state, credentials })
  }

  openSetup = () => {
    const device = { ...this.state }
    if (this.state.isIoTButton) {
      const screenParams = {
        isEdgeDevice: false,
        deviceDetails: device
      }
      this.props.navigation.navigate('SetupScreen', screenParams)
    } else {
      this.props.navigation.navigate('DeviceVersionScreen', { deviceDetails: device })
    }
  }

  render() {
    const isWindows = Platform.OS === 'windows';

    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.metadataContainer}>
            <Text style={styles.instructionText}>
              We need some information about your IoT device.
          </Text>
            <View style={styles.textInputGroup}>
              <Text style={styles.textInputLabel}>This is an IoT Button</Text>
              <Switch onValueChange={this.setIotButton} value={this.state.isIoTButton} />
            </View>
            <View style={styles.textInputGroup}>
              <Text style={styles.textInputLabel}>Access Point Host</Text>
              <TextInput underlineColorAndroid="transparent" style={styles.textInputContainer}
                onChangeText={this.setAccessPointHost} autoCapitalize="none" autoCorrect={false} />
            </View>
            <View style={styles.textInputGroup}>
              <Text style={styles.textInputLabel}>Access Point SSID</Text>
              <TextInput underlineColorAndroid="transparent" style={styles.textInputContainer}
                onChangeText={this.setAccessPointSSID} autoCapitalize="none" autoCorrect={false} />
            </View>
            <View style={styles.textInputGroup}>
              <Text style={styles.textInputLabel}>Access Point Passphrase</Text>
              <PasswordInput inputValue={this.state.accessPoint.passphrase}
                onChangeText={this.setAccessPointPassphrase} disableShow={isWindows} />
            </View>
            {!this.state.isIoTButton && <View style={styles.textInputGroup}>
              <Text style={styles.textInputLabel}>IoT Device Login Username</Text>
              <TextInput underlineColorAndroid="transparent" style={styles.textInputContainer}
                onChangeText={this.setCredentialsUser} autoCapitalize="none" autoCorrect={false} />
            </View>}
            {!this.state.isIoTButton && <View style={styles.textInputGroup}>
              <Text style={styles.textInputLabel}>IoT Device Login Password</Text>
              <PasswordInput inputValue={this.state.credentials.password}
                onChangeText={this.setCredentialsPassword} disableShow={isWindows} />
            </View>}
          </View>
        </ScrollView>
        <View>
          <View style={styles.navigationContainer}>
            <View style={styles.navigationButtonContainer}>
              <TouchableOpacity style={[styles.navigationButton, styles.nextButton]} onPress={this.openSetup}>
                <Text style={styles.navigationButtonText}>NEXT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MetadataEntryScreen)
