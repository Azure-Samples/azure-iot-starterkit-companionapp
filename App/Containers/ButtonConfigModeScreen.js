import React, { Component } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import NavBar from './NavBar'

// Styles
import styles from './Styles/ButtonConfigModeScreenStyle'

class ButtonConfigModeScreen extends Component {
  openConnect = () => {
    this.props.navigation.navigate('WifiConnectScreen', this.props)
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <View style={styles.buttonConfigModeContainer}>
          <Text style={styles.instructionText}>
            Please put your button into configuration mode by pressing and holding the button for 5 seconds until the LED is blinking yellow. When the LED is blinking red, it will be in configuration mode. The button will stay in this mode for 2 minutes.
          </Text>
          <Text style={styles.instructionText}>
            Click NEXT when your button is in configuration mode.
          </Text>
        </View>
        <View>
          <View style={styles.navigationContainer}>
            <View style={styles.navigationButtonContainer}>
              <TouchableOpacity style={[styles.navigationButton, styles.nextButton]} onPress={this.openConnect}>
                <Text style={styles.navigationButtonText}>NEXT</Text>
              </TouchableOpacity>
            </View>
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
    isEdgeDevice: ownProps.navigation.state.params.isEdgeDevice,
    deviceDetails: ownProps.navigation.state.params.deviceDetails,
    connectionString: ownProps.navigation.state.params.connectionString,
    accessKey: ownProps.navigation.state.params.accessKey
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ButtonConfigModeScreen)
