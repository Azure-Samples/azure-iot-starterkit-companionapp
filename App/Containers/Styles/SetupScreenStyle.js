import { StyleSheet } from 'react-native'
import { ApplicationStyles, Metrics, Colors } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  setupContainer: {
    flexGrow: 1,
    marginTop: Metrics.baseMargin,
    marginBottom: Metrics.doubleBaseMargin
  },
  backButton: {
    backgroundColor: Colors.azureDark
  },
  nextButton: {
    backgroundColor: Colors.azureLight
  }
})
