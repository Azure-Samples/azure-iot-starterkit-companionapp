import { StyleSheet } from 'react-native'
import { ApplicationStyles, Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  buttonConfigModeContainer: {
    flexGrow: 1,
    marginTop: Metrics.doubleSection,
    justifyContent: 'center'
  },
  backButton: {
    backgroundColor: Colors.azureDark
  },
  nextButton: {
    backgroundColor: Colors.azureLight
  }
})
