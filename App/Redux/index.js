import { combineReducers, createStore } from 'redux'

export const reducers = combineReducers({
  nav: require('./NavigationRedux').reducer,
  login: require('./LoginRedux').reducer,
  resources: require('./ResourcesRedux').reducer
})

export default () => {
  return createStore(reducers)
}
