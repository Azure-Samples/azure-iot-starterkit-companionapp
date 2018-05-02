import { Platform, StyleSheet } from 'react-native'
import { Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  ...Platform.select({
    ios: {
      navBarContainer: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: Metrics.doubleSection,
        marginHorizontal: Metrics.doubleBaseMargin,
        paddingTop: 8,
        paddingBottom: 8
      }
    },
    android: {
      navBarContainer: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: Metrics.baseMargin,
        marginHorizontal: Metrics.doubleBaseMargin,
        paddingTop: 8,
        paddingBottom: 8
      }
    },
    windows: {
      navBarContainer: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: Metrics.baseMargin,
        marginHorizontal: Metrics.doubleBaseMargin,
        paddingTop: 8,
        paddingBottom: 8
      }
    }
  }),
  linkButtonText: {
    color: Colors.snow,
    fontSize: 14,
    fontWeight: 'bold'
  }
})
