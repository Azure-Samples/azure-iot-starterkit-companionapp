import { StyleSheet } from 'react-native'
import { ApplicationStyles, Metrics, Colors, Fonts } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  wifiConnectContainer: {
    flexGrow: 1,
    marginTop: Metrics.baseMargin,
    marginBottom: Metrics.doubleBaseMargin
  },
  infoText: {
    fontFamily: Fonts.type.base,
    fontSize: 16,
    color: Colors.snow,
    marginHorizontal: Metrics.doubleBaseMargin
  },
  stepText: {
    fontFamily: Fonts.type.base,
    fontSize: 16,
    color: Colors.snow,
    marginHorizontal: Metrics.doubleBaseMargin,
    marginVertical: Metrics.baseMargin
  },
  backButton: {
    backgroundColor: Colors.azureDark
  },
  nextButton: {
    backgroundColor: Colors.azureLight
  }
})
