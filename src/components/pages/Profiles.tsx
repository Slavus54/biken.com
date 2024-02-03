import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {ITINERARY_TYPES, LEVELS, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import MapPicker from '../UI&UX/MapPicker'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'
import {TownType, Cords} from '../../types/types'

const Profiles: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [username, setUsername] = useState<string>('')
    const [isMyDay, setIsMyDay] = useState<boolean>(true)
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<Cords>(towns[0].cords)
    const [profiles, setProfiles] = useState(null)
    const [filtered, setFiltered] = useState([])

    const centum = new Centum()

    const getProfilesM = gql`
        mutation getProfiles($username: String!) {
            getProfiles(username: $username) {
                account_id
                username
                security_code
                telegram
                weekday
                region
                cords {
                    lat
                    long
                }
                main_photo
                bicycles {
                    shortid
                    title
                    category
                    status
                    mileage
                    image
                    likes
                }
                account_components {
                    shortid
                    title
                    path
                }
            }
        }
    `

    const [getProfiles] = useMutation(getProfilesM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProfiles)
            setProfiles(data.getProfiles)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProfiles({
                variables: {
                    username: context.username
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (region !== '') {
            let result = towns.find(el => centum.search(el.title, region, SEARCH_PERCENT)) 
    
            if (result !== undefined) {
                setRegion(result.title)
                setCords(result.cords)
            }           
        }
    }, [region])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 16})
    }, [cords])

    useMemo(() => {
        if (profiles !== null) {
            let result = profiles.filter(el => el.region === region)

            if (username !== '') {
                result = result.filter(el => centum.search(el.username, username, SEARCH_PERCENT))
            }

            result = result.filter(el => isMyDay === (el.weekday === context.weekday))
         
            setFiltered(result)
        }
    }, [profiles, username, isMyDay, region])

    return (
        <>          
            <h1>Найдите велолюбителей</h1>
            
            <div className='items small'>
                <div className='item'>
                    <h4 className='pale'>Полное имя</h4>
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder='Имя пользователя' type='text' />
                </div>
                <div className='item'>
                    <h4 className='pale'>Где находится?</h4>
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Ближайший город' type='text' />
                </div>
            </div>
            
            <h4 className='pale'>День променажа</h4>
            <button onClick={() => setIsMyDay(!isMyDay)} className='light-btn'>{isMyDay ? 'Мой' : 'Иной'}</button>

            <DataPagination initialItems={filtered} setItems={setFiltered} label='Список пользователей:' />
            {profiles !== null &&
                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                    <Marker latitude={cords.lat} longitude={cords.long}>
                        <MapPicker type='picker' />
                    </Marker>
                    
                    {filtered.map(el =>
                        <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                            <NavigatorWrapper id={el.account_id} isRedirect={true}>
                                {centum.shorter(el.username)}
                            </NavigatorWrapper>
                        </Marker>
                    )}
                </ReactMapGL>  
            }  
        
            {profiles === null && <Loading />} 
        </>
    )
}

export default Profiles