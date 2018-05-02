import { StyleSheet } from 'react-native'
import { ApplicationStyles, Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  metadataContainer: {
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
