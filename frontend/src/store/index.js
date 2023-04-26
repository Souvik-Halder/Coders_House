
//view the redux toolkit documentation for better understanding
import { configureStore } from '@reduxjs/toolkit'
import auth from './authSlice'
import activate from './activateSlice'
export const store = configureStore({
  reducer: {
    auth,
    activate
  },
})

