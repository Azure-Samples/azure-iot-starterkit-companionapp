import React, { Component } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import NavBar from './NavBar'

// Styles
import styles from './Styles/ScanScreenStyle'

class ScanScreen extends Component {
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
          <TouchableOpacity onPress={this.openMetadata}>
            <View pointerEvents='none'>
              <Text style={styles.switchLink}>Enter device information manually</Text>
            </View>
          </TouchableOpacity>
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
