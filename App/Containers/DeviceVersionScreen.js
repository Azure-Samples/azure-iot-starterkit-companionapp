import React, { Component } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import SimpleButton from '../Components/SimpleButton'
import NavBar from './NavBar'

// Styles
import styles from './Styles/DeviceVersionScreenStyle'

class DeviceVersionScreen extends Component {
  openSetupScreen = (isEdgeDevice) => {
    const screenParams = {
      isEdgeDevice,
      deviceDetails: this.props.deviceDetails
    }
    this.props.navigation.navigate('SetupScreen', screenParams)
  }

  openLaunchScreen = () => {
    this.props.navigation.navigate('LaunchScreen')
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <View style={styles.deviceVersionContainer}>
          <Text style={styles.instructionText}>
            Do you want to set this up as an IoT Edge device?
          </Text>
          <SimpleButton style={styles.yesButton} text='Yes' onPress={() => this.openSetupScreen(true)} />
          <SimpleButton style={styles.noButton} text='No / Azure IoT Button' onPress={() => this.openSetupScreen(false)} />
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    deviceDetails: ownProps.navigation.state.params.deviceDetails
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceVersionScreen)
