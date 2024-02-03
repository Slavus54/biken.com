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

const Itineraries: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>(ITINERARY_TYPES[0])
    const [level, setLevel] = useState<string>(LEVELS[0])
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<Cords>(towns[0].cords)
    const [itineraries, setItineraries] = useState(null)
    const [filtered, setFiltered] = useState([])

    const centum = new Centum()

    const getItinerariesM = gql`
        mutation getItineraries($username: String!) {
            getItineraries(username: $username) {
                shortid
                account_id
                username
                title
                category
                level
                region
                cords {
                    lat
                    long
                }
                points {
                    id
                    label
                    surface
                    score
                    dot {
                        lat
                        long
                    }
                }
                distance
                latest_bike
                races {
                    shortid
                    name
                    text
                    speed
                    image
                    respect
                }
                invites {
                    shortid
                    name
                    fullname
                    category
                    percent
                    dateUp
                }
            }
        }
    `

    const [getItineraries] = useMutation(getItinerariesM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getItineraries)
            setItineraries(data.getItineraries)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getItineraries({
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
        if (itineraries !== null) {
            let result = itineraries.filter(el => el.region === region)

            if (title !== '') {
                result = result.filter(el => centum.search(el.title, title, SEARCH_PERCENT))
            }

            result = result.filter(el => el.category === category && el.level === level)

            setFiltered(result)
        }
    }, [itineraries, title, category, level, region])

    return (
        <>          
            <h1>Попробуйте новый маршрут</h1>
            
            <div className='items small'>
                <div className='item'>
                    <h4 className='pale'>Название</h4>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Имя маршрута' type='text' />
                </div>
                <div className='item'>
                    <h4 className='pale'>Где находится?</h4>
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Ближайший город' type='text' />
                </div>
            </div>
            
            <h4 className='pale'>Местность и сложность</h4>
            
            <div className='items small'>
                {ITINERARY_TYPES.map(el => <div onClick={() => setCategory(el)} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
            </div>
        
            <select value={level} onChange={e => setLevel(e.target.value)}>
                {LEVELS.map(el => <option value={el}>{el}</option>)}
            </select>    

            <DataPagination initialItems={filtered} setItems={setFiltered} label='Карта маршрутов:' />
            
            {itineraries !== null &&
                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                    <Marker latitude={cords.lat} longitude={cords.long}>
                        <MapPicker type='picker' />
                    </Marker>
                    
                    {filtered.map(el =>
                        <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                            <NavigatorWrapper id='' isRedirect={false} url={`/itinerary/${el.shortid}`}>
                                {centum.shorter(el.title)}
                            </NavigatorWrapper>
                        </Marker>
                    )}
                </ReactMapGL>  
            }  
        
            {itineraries === null && <Loading />} 
        </>
    )
}

export default Itineraries