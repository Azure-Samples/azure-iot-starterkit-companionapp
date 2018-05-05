import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  login: ['username', 'tenant'],
  logout: null
})

export const LoginTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  loggedIn: false,
  loggedInUser: null,
  loggedInTenant: null
})

/* ------------- Selectors ------------- */

export const LoginSelectors = {
  getLoggedIn: state => state.loggedIn,
  getLoggedInUser: state => state.loggedInUser,
  getLoggedInTenant: state => state.loggedInTenant
}

/* ------------- Reducers ------------- */

// successful login
export const loginSuccess = (state, { username, tenant }) => {
  return state.merge({ loggedIn: true, loggedInUser: username, loggedInTenant: tenant })
}

// successful logout
export const logoutSuccess = (state) => {
  return state.merge({ loggedIn: false, loggedInUser: null, loggedInTenant: null })
}

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.LOGIN]: loginSuccess,
  [Types.LOGOUT]: logoutSuccess
})
