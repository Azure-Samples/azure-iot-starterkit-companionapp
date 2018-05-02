import { StyleSheet } from 'react-native'
import { ApplicationStyles, Metrics } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  edgeInstallContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    marginTop: Metrics.doubleSection
  }
})
