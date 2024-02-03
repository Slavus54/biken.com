import {useState, useMemo} from 'react';
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks';
import {SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import MapPicker from '../UI&UX/MapPicker'
import {AccountPageComponentProps, Cords, TownType} from '../../types/types'

const GeoProfileInfo = ({profile, context} : AccountPageComponentProps) => {
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [cords, setCords] = useState<Cords>({lat: profile.cords.lat, long: profile.cords.long})
    const [state, setState] = useState({
        region: profile.region
    })

    const centum = new Centum()

    const {region} = state
  
    const updateProfileGeoInfoM = gql`
        mutation updateProfileGeoInfo($account_id: String!, $region: String!, $cords: ICord!) {
            updateProfileGeoInfo(account_id: $account_id, region: $region, cords: $cords) 
        }
    `

    const [updateProfileGeoInfo] = useMutation(updateProfileGeoInfoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateProfileGeoInfo)
            window.location.reload()
        }
    })

    useMemo(() => {
        if (region !== '' && region !== profile.region) {
            let result = towns.find(el => centum.search(el.title, region, SEARCH_PERCENT))

            if (result !== undefined) {
                setState({...state, region: result.title})
                setCords(result.cords)
            }
        }
    }, [region])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 17})
    }, [cords])

    const onUpdate = () => {
        updateProfileGeoInfo({
            variables: {
                account_id: context.account_id, region, cords
            }
        })
    }
 
    return (
        <>
            <h2>Где вы находитесь?</h2>
            
            <input value={region} onChange={e => setState({...state, region: e.target.value})} placeholder='Ближайший город' type='text' />
            
            <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                <Marker latitude={cords.lat} longitude={cords.long}>
                    <MapPicker type='picker' />
                </Marker>
            </ReactMapGL>      
            <button onClick={onUpdate}>Обновить</button>
        </> 
    )
}

export default GeoProfileInfo