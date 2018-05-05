import React, { Component } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { NavigationActions } from 'react-navigation'
import QRCodeScanner from 'react-native-qrcode-scanner';
import { connect } from 'react-redux'
import NavBar from './NavBar'

// Styles
import styles from './Styles/ScanScreenStyle'

class ScanScreen extends Component {
  constructor(props) {
    super(props);
    this.scanner = null;
    this.state = {
      active: true
    }
  }

  refreshScreen = () => {
    this.setState({ ...this.state, active: true })
    this.scanner && this.scanner.reactivate();
  }

  openDeviceDetails = (event) => {
    try {
      const device = event && event.data && JSON.parse(event.data);
      if (device) {
        if (device.isIoTButton) {
          const screenParams = {
            isEdgeDevice: false,
            deviceDetails: device,
            onBack: () => this.refreshScreen()
          }
          this.props.navigation.navigate('SetupScreen', screenParams)
        } else {
          this.props.navigation.navigate('DeviceVersionScreen', { deviceDetails: device, onBack: () => this.refreshScreen() })
        }
      }
    } catch (error) {
      console.log(error)
      Alert.alert(
        'Invalid QR Code',
        'The QR code is invalid. Please try again.',
        [{ text: 'Dismiss' }]
      )
    }
  }

  openHome = () => {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'LaunchScreen' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  openMetadata = () => {
    this.setState({ ...this.state, active: false }, () => {
      this.props.navigation.navigate('MetadataEntryScreen', { onBack: () => this.refreshScreen() })
    })
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <View style={styles.scannerContainer}>
          {this.state.active && <QRCodeScanner ref={(node) => { this.scanner = node }} onRead={this.openDeviceDetails.bind(this)}
            topContent={<Text style={styles.instructionText}>Scan the QR code provided by the kit for your IoT device</Text>}
            bottomContent={<TouchableOpacity onPress={this.openMetadata}>
              <View pointerEvents='none'>
                <Text style={[styles.switchLink, { textAlign: 'center' }]}>I don't see a QR code.</Text>
                <Text style={[styles.switchLink, { textAlign: 'center' }]}>I want to enter the device information manually</Text>
              </View>
            </TouchableOpacity>} />}
        </View>
        <View>
          <TouchableOpacity style={styles.navigationButton} onPress={this.openHome}>
            <Text style={styles.navigationButtonText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(ScanScreen)
