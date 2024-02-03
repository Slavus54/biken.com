import axios from 'axios' 
import {WEBSERVER_URL} from '../env/env'

// Towns API

const api_key = 'towns'

export const init = async () => {
    let check = localStorage.getItem(api_key)

    if (check === null) {
        let data = (await axios.get(`${WEBSERVER_URL}/towns`)).data

        localStorage.setItem(api_key, JSON.stringify(data))
    } 
}

export const gain = () => {
    return JSON.parse(localStorage.getItem(api_key))
}