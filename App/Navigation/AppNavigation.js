import { StackNavigator } from 'react-navigation'
import ButtonConfigModeScreen from '../Containers/ButtonConfigModeScreen'
import ButtonOperatingModeScreen from '../Containers/ButtonOperatingModeScreen'
import MetadataEntryScreen from '../Containers/MetadataEntryScreen'
import CreateAppScreen from '../Containers/CreateAppScreen'
import SetPasswordScreen from '../Containers/SetPasswordScreen'
import EdgeInstallScreen from '../Containers/EdgeInstallScreen'
import WifiConnectScreen from '../Containers/WifiConnectScreen'
import DeviceVersionScreen from '../Containers/DeviceVersionScreen'
import ScanScreen from '../Containers/ScanScreen'
import SetupScreen from '../Containers/SetupScreen'
import NavBar from '../Containers/NavBar'
import LaunchScreen from '../Containers/LaunchScreen'

import styles from './Styles/NavigationStyles'

// Manifest of possible screens
const PrimaryNav = StackNavigator({
  ButtonConfigModeScreen: { screen: ButtonConfigModeScreen },
  ButtonOperatingModeScreen: { screen: ButtonOperatingModeScreen },
  MetadataEntryScreen: { screen: MetadataEntryScreen },
  CreateAppScreen: { screen: CreateAppScreen },
  SetPasswordScreen: { screen: SetPasswordScreen },
  EdgeInstallScreen: { screen: EdgeInstallScreen },
  WifiConnectScreen: { screen: WifiConnectScreen },
  DeviceVersionScreen: { screen: DeviceVersionScreen },
  ScanScreen: { screen: ScanScreen },
  SetupScreen: { screen: SetupScreen },
  NavBar: { screen: NavBar },
  LaunchScreen: { screen: LaunchScreen }
}, {
    // Default config for all screens
    headerMode: 'none',
    initialRouteName: 'LaunchScreen',
    navigationOptions: {
      headerStyle: styles.header
    }
  })

export default PrimaryNav
