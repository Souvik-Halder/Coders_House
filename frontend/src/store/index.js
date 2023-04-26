
//view the redux toolkit documentation for better understanding
import { configureStore } from '@reduxjs/toolkit'
import auth from './authSlice'
export const store = configureStore({
  reducer: {
    auth,
  },
})

