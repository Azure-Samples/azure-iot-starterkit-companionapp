import { StyleSheet } from 'react-native'
import { Colors, Fonts, Metrics, ApplicationStyles } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  launchTitleText: {
    ...Fonts.style.h4,
    color: Colors.snow,
    textAlign: 'center'
  },
  launchContent: {
    flex: 1,
    justifyContent: 'center'
  },
  logoContainer: {
    flex: 0,
    alignItems: 'center'
  },
  centered: {
    alignItems: 'center'
  },
  hintText: {
    fontSize: 14,
    color: Colors.snow
  }
})
