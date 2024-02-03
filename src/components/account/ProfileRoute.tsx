import {useState, useMemo} from 'react';
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {useSelector, useDispatch} from 'react-redux'
import {initRoute, resetAllWaypoints} from '../../store/slices/RouteSlice'
import {VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import {weekdays_titles} from 'datus.js'
import NavigatorWrapper from '../router/NavigatorWrapper'
import MapPicker from '../UI&UX/MapPicker'
import CloseIt from '../UI&UX/CloseIt'
import {AccountPageComponentProps, Cords, RouteSlice, Waypoint} from '../../types/types'

const ProfileRoute = ({profile, context} : AccountPageComponentProps) => {
    const [view, setView] = useState(VIEW_CONFIG)
    const [weekday, setWeekday] = useState<string>(profile.weekday)
    const [zoomPercent, setZoomPercent] = useState<number>(90)
    const [zoom, setZoom] = useState<number>(17)
    const [miles, setMiles] = useState<number>(0)
    const [cords, setCords] = useState<Cords>({lat: profile.cords.lat, long: profile.cords.long})
    const [waypoint, setWaypoint] = useState<Waypoint | null>(null)
    const currentCords: Cords = useSelector((state: RouteSlice) => state.route.currentCords)
    const waypoints: any = useSelector((state: RouteSlice) => state.route.waypoints)
    const distance: any = useSelector((state: RouteSlice) => state.route.distance)

    const centum = new Centum()
    const dispatch = useDispatch()

    useMemo(() => {
        if (context.account_id !== '') {
            let initialWaypointCords = distance === 0 ? profile.cords : currentCords
            console.log(1)
            dispatch(initRoute(initialWaypointCords))
            setCords(initialWaypointCords)
            setMiles(centum.distance(distance, 'km', 'mile', 1))
        }
    }, [context.account_id])

    useMemo(() => {
        setZoom(centum.part(zoomPercent, 18))
    }, [zoomPercent])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom})
    }, [cords, zoom])

    const updateProfileWeekdayM = gql`
        mutation updateProfileWeekday($account_id: String!, $weekday: String!) {
            updateProfileWeekday(account_id: $account_id, weekday: $weekday) 
        }
    `

    const [updateProfileWeekday] = useMutation(updateProfileWeekdayM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateProfileWeekday)
            window.location.reload()
        }
    })

    const onUpdateDay = () => {
        updateProfileWeekday({
            variables: {
                account_id: context.account_id, weekday
            }
        })
    }

    return (
        <>           
            <h2>Постройте свой маршрут</h2> 

            <div className='items small'>
                <h4 className='pale'>Всего точек: <b>{waypoints.length}</b></h4>
                <h4 className='pale'>Дистанция: <b>{distance}</b> км (<b>{miles}</b> мили)</h4>
            </div>

            <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                <Marker latitude={profile.cords.lat} longitude={profile.cords.long}>
                    <MapPicker type='home' />
                </Marker>
                <Marker latitude={cords.lat} longitude={cords.long}>
                    <MapPicker type='picker' />
                </Marker>
                
                {waypoints.map(el => 
                    <Marker onClick={() => setWaypoint(el)} latitude={el.cords.lat} longitude={el.cords.long}>
                        {centum.shorter(el.title)}
                    </Marker>  
                )}  
            </ReactMapGL>      
            <input value={zoomPercent} onChange={e => setZoomPercent(parseInt(e.target.value))} type='range' step={1} />
            <button onClick={() => dispatch(resetAllWaypoints())} className='light-btn'>Сбросить</button>

            {waypoint !== null &&
                <>
                    <CloseIt onClick={() => setWaypoint(null)} />

                    <h2>{waypoint.title}</h2>
             
                    <div className='items small'>
                        <h4 className='pale'>Тип: {waypoint.category}</h4>
                        <h4 className='pale'>Поверхность: {waypoint.surface}</h4>
                    </div>

                    <NavigatorWrapper isRedirect={false} url={`/place/${waypoint.shortid}`}>
                        <button>Посетить</button>
                    </NavigatorWrapper>
                </>
            }

            <h3 className='pale'>День променажа</h3>
            <div className='items half'>
                {weekdays_titles.map(el => <div onClick={() => setWeekday(el)} className={el === weekday ? 'item label active' : 'item label'}>{el}</div>)}
            </div>
            <button onClick={onUpdateDay} className='light-btn'>Обновить</button>
        </> 
    )
}

export default ProfileRoute