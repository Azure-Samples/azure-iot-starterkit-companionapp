import { StyleSheet } from 'react-native'
import { ApplicationStyles, Colors, Fonts, Metrics } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  createAppContainer: {
    marginTop: Metrics.doubleSection,
    justifyContent: 'center',
    flexGrow: 1
  },
  stepText: {
    fontFamily: Fonts.type.base,
    fontSize: 16,
    color: Colors.snow,
    marginHorizontal: Metrics.section,
    marginVertical: Metrics.smallMargin,
    textAlign: 'center'
  },
  noButton: {
    backgroundColor: Colors.azureDark
  },
  yesButton: {
    backgroundColor: Colors.azureLight
  }
})
