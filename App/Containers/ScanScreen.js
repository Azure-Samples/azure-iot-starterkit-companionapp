import React, { Component } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner';
import { connect } from 'react-redux'
import NavBar from './NavBar'

// Styles
import styles from './Styles/ScanScreenStyle'

class ScanScreen extends Component {
  openDeviceDetails = (event) => {
    try {
      const device = event && event.data && JSON.parse(event.data);
      if (device) {
        if (device.isIoTButton) {
          const screenParams = {
            isEdgeDevice: false,
            deviceDetails: device
          }
          this.props.navigation.navigate('SetupScreen', screenParams)
        } else {
          this.props.navigation.navigate('DeviceVersionScreen', { deviceDetails: device })
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
    this.props.navigation.navigate('LaunchScreen')
  }

  openMetadata = () => {
    this.props.navigation.navigate('MetadataEntryScreen')
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <View style={styles.scannerContainer}>
          <QRCodeScanner onRead={this.openDeviceDetails.bind(this)} reactivate={true} reactivateTimeout={2000}
            topContent={<Text style={styles.instructionText}>Scan the QR code provided by the kit for your IoT device</Text>}
            bottomContent={<TouchableOpacity onPress={this.openMetadata}>
              <View pointerEvents='none'>
                <Text style={[styles.switchLink, { textAlign: 'center' }]}>I don't see a QR code.</Text>
                <Text style={[styles.switchLink, { textAlign: 'center' }]}>I want to enter the device information manually</Text>
              </View>
            </TouchableOpacity>} />
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
