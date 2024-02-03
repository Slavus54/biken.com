import Centum from 'centum.js'
import {createSlice} from '@reduxjs/toolkit'

const centum = new Centum()

export const RouteSlice = createSlice({
    name: 'route',
    initialState: {
        currentCords: {
            lat: 0,
            long: 0
        },
        waypoints: [],
        distance: 0
    },
    reducers: {
        initRoute: (state, {payload}) => {
            state.currentCords = payload
        },
        addRouteWaypoint: (state, {payload}) => {
            let distance = centum.haversine([state.currentCords.lat, state.currentCords.long, payload.cords.lat, payload.cords.long], 1)

            distance /= 1e3

            if (payload.cords.lat !== state.currentCords.lat) {

                state.currentCords = payload.cords
                state.waypoints = [...state.waypoints, payload]
                state.distance += distance
            }            
        },
        resetAllWaypoints: (state) => {
            state.waypoints = []
            state.distance = 0
        
            window.location.reload()
        }
    }   
})

export const {initRoute, addRouteWaypoint, resetAllWaypoints} = RouteSlice.actions

export default RouteSlice.reducer