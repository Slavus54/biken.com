import {configureStore} from '@reduxjs/toolkit'
import RouteSlice from './slices/RouteSlice'

export default configureStore({
    reducer: {
        route: RouteSlice
    }
})