import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  clearAll: null,
  subscriptionSuccess: ['subscriptions'],
  locationSuccess: ['subscription', 'locations'],
  resourceGroupSuccess: ['subscription', 'resourceGroups'],
  iotHubSuccess: ['subscription', 'iotHubs'],
  deviceSuccess: ['iotHub', 'devices'],
  registrySuccess: ['subscription', 'registries'],
  requestingResources: null,
  requestFailed: null
})

export const ResourcesTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  fetching: false,
  error: false,
  subscriptions: [],
  locations: {},
  resourceGroups: {},
  iotHubs: {},
  devices: {},
  registries: {}
})

/* ------------- Selectors ------------- */

export const ResourcesSelectors = {
  getSubscriptions: state => state.subscriptions,
  getLocations: state => state.locations,
  getResourceGroups: state => state.resourceGroups,
  getIotHubs: state => state.iotHubs,
  getDevices: state => state.devices,
  getRegistries: state => state.registries
}

/* ------------- Reducers ------------- */

// requesting data from Azure
export const resourcesRequestStart = (state) =>
  state.merge({ fetching: true })

// failed requesting data from Azure
export const resourcesRequestFailed = state =>
  state.merge({ fetching: false, error: true })

// successful subscriptions lookup
export const subscriptionSuccess = (state, { subscriptions }) => {
  return state.merge({ fetching: false, error: false, subscriptions })
}

// successful locations lookup
export const locationSuccess = (state, { subscription, locations }) => {
  const newLocations = { ...state.locations, [subscription]: locations }
  return state.merge({ fetching: false, error: false, locations: newLocations })
}

// successful resource groups lookup
export const resourceGroupSuccess = (state, { subscription, resourceGroups }) => {
  const newResourceGroups = { ...state.resourceGroups, [subscription]: resourceGroups }
  return state.merge({ fetching: false, error: false, resourceGroups: newResourceGroups })
}

// successful IoT hubs lookup
export const iotHubSuccess = (state, { subscription, iotHubs }) => {
  const newIotHubs = { ...state.iotHubs, [subscription]: iotHubs }
  return state.merge({ fetching: false, error: false, iotHubs: newIotHubs })
}

// successful devices lookup
export const deviceSuccess = (state, { iotHub, devices }) => {
  const newDevices = { ...state.devices, [iotHub]: devices }
  return state.merge({ fetching: false, error: false, devices: newDevices })
}

// successful registries lookup
export const registrySuccess = (state, { subscription, registries }) => {
  const newRegistries = { ...state.registries, [subscription]: registries }
  return state.merge({ fetching: false, error: false, registries: newRegistries })
}

export const clearAll = (state) => {
  return INITIAL_STATE;
}

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.REQUESTING_RESOURCES]: resourcesRequestStart,
  [Types.REQUEST_FAILED]: resourcesRequestFailed,
  [Types.SUBSCRIPTION_SUCCESS]: subscriptionSuccess,
  [Types.LOCATION_SUCCESS]: locationSuccess,
  [Types.RESOURCE_GROUP_SUCCESS]: resourceGroupSuccess,
  [Types.IOT_HUB_SUCCESS]: iotHubSuccess,
  [Types.DEVICE_SUCCESS]: deviceSuccess,
  [Types.REGISTRY_SUCCESS]: registrySuccess,
  [Types.CLEAR_ALL]: clearAll
})
