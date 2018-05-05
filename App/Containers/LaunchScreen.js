import React, { Component } from 'react'
import { Alert, Image, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { StackNavigator } from 'react-navigation'
import { connect } from 'react-redux'
import SimpleButton from '../Components/SimpleButton'
import DeviceVersionScreen from '../Containers/DeviceVersionScreen'
import SetupScreen from '../Containers/SetupScreen'
import ScanScreen from '../Containers/ScanScreen'
import LoginActions from '../Redux/LoginRedux'
import ResourcesActions from '../Redux/ResourcesRedux'
import { interactiveLoginToAzure, setTenant } from '../Services/AzureRestApi'
import Images from '../Themes/Images'
import NavBar from './NavBar'

// Styles
import styles from './Styles/LaunchScreenStyles'

class LaunchScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tenant: null,
      altLoginModalVisible: false
    }
  }

  login = () => {
    interactiveLoginToAzure().then(authDetails => {
      this.props.login(authDetails.userInfo.givenName)
    }).catch(error => console.log(error))
  }

  altLogin = () => {
    const { tenant } = this.state;
    if (tenant) {
      setTenant(tenant)
      interactiveLoginToAzure().then(authDetails => {
        this.props.login(authDetails.userInfo.givenName, tenant)
        this.setState({ ...this.state, altLoginModalVisible: false })
      }).catch(error => console.log(error))
    } else {
      Alert.alert(
        'Whoops',
        'Please enter an Azure domain',
        [{ text: 'Dismiss' }]
      )
    }
  }

  openDeviceVersionScreen = () => {
    if (Platform.OS === 'windows') {
      this.props.navigation.navigate('MetadataEntryScreen')
    } else {
      this.props.navigation.navigate('ScanScreen')
    }
  }

  openAltLoginModal = () => {
    this.setState({ ...this.state, altLoginModalVisible: true })
  }

  closeAltLogin = () => {
    this.setState({ ...this.state, altLoginModalVisible: false })
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        {!this.state.altLoginModalVisible && <View style={styles.launchContent}>
          {!this.props.loggedIn && <View style={styles.logoContainer}>
            <Image source={Images.azureLogo} />
            <Text style={[styles.launchTitleText, { marginBottom: 20 }]}>
              Azure IoT Starter Kit Companion
            </Text>
          </View>}
          {this.props.loggedIn && <View>
            <Text style={styles.instructionText}>
              Hello there, {this.props.loggedInUser}.
            </Text>
            <SimpleButton text='Get Started' onPress={this.openDeviceVersionScreen} />
          </View>}
          {!this.props.loggedIn && <View>
            <SimpleButton text='Login with your Personal Account' onPress={this.openAltLoginModal} />
            <SimpleButton text='Login with your Work/School Account' onPress={this.login} />
          </View>}
        </View>}
        {this.state.altLoginModalVisible && <View style={styles.launchContent}>
          <View style={[styles.textInputGroup, { paddingHorizontal: 20 }]}>
            <Text style={styles.textInputLabel}>
              What is your Azure domain?
            </Text>
            <Text style={styles.hintText}>
              You can find this by hovering over your avatar in the Azure Portal. For example:
            </Text>
            <Text style={[styles.hintText, { marginTop: 10 }]}>
              meoutlook.onmicrosoft.com
            </Text>
            <Text style={[styles.hintText, { marginTop: 5, marginBottom: 10 }]}>
              myalias.mycustomdomain.com
            </Text>
            <TextInput underlineColorAndroid="transparent" style={styles.textInputContainer}
              onChangeText={(value) => { this.setState({ ...this.state, tenant: value.trim() }) }}
              autoCapitalize="none" autoCorrect={false} />
          </View>
          <SimpleButton text='Login' onPress={this.altLogin} />
        </View>}
        {this.state.altLoginModalVisible && <View>
          <TouchableOpacity style={styles.navigationButton} onPress={this.closeAltLogin}>
            <Text style={styles.navigationButtonText}>CANCEL</Text>
          </TouchableOpacity>
        </View>}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    loggedIn: state.login.loggedIn,
    loggedInUser: state.login.loggedInUser
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    login: (username) => {
      dispatch(LoginActions.login(username))
      dispatch(ResourcesActions.clearAll())
    },
    logout: () => {
      dispatch(LoginActions.logout())
      dispatch(ResourcesActions.clearAll())
    }
  }
}

const launchScreen = connect(mapStateToProps, mapDispatchToProps)(LaunchScreen)

export default StackNavigator({
  LaunchScreen: { screen: launchScreen }
}, {
    initialRouteName: 'LaunchScreen',
    headerMode: 'none',
    navigationOptions: {}
  })
