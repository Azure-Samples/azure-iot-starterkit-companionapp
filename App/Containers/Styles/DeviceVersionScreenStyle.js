import { StyleSheet } from 'react-native'
import { ApplicationStyles, Metrics, Colors } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  deviceVersionContainer: {
    marginTop: Metrics.doubleSection,
    justifyContent: 'center',
    flexGrow: 1
  },
  noButton: {
    backgroundColor: Colors.azureDark
  },
  yesButton: {
    backgroundColor: Colors.azureLight
  }
})
