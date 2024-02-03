import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {ITINERARY_TYPES, LEVELS, SURFACES, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import shortid from 'shortid'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType, TownType} from '../../types/types'

const CreateItinerary: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [isStartFlag, setIsStartFlag] = useState<boolean>(true)
    const [idx, setIdx] = useState<number>(0)
    const [point, setPoint] = useState({
        id: shortid.generate().toString(),
        label: '',
        surface: SURFACES[0],
        score: 0,
        dot: {lat: 0, long: 0}
    })
    const [state, setState] = useState({
        title: '', 
        category: ITINERARY_TYPES[0], 
        level: LEVELS[0],
        region: towns[0].title, 
        cords: towns[0].cords,
        points: [], 
        distance: 0
    })

    const centum = new Centum()

    const {title, category, level, region, cords, points, distance} = state
    const {id, label, surface, score, dot} = point

    const createItineraryM = gql`
        mutation createItinerary($username: String!, $id: String!, $title: String!, $category: String!, $level: String!, $region: String!, $cords: ICord!, $points: [IPoint]!, $distance: Float!) {
            createItinerary(username: $username, id: $id, title: $title, category: $category, level: $level, region: $region, cords: $cords, points: $points, distance: $distance)
        }
    `

    const [createItinerary] = useMutation(createItineraryM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createItinerary)
            window.location.reload()
        }
    })

    useMemo(() => {
        if (region !== '') {
            let result = towns.find(el => centum.search(el.title, region, SEARCH_PERCENT)) 
    
            if (result !== undefined) {
                setState({...state, region: result.title, cords: result.cords})
            }           
        }
    }, [region])

    useMemo(() => {
        setView({...view, latitude: isStartFlag ? cords.lat : dot.lat, longitude: isStartFlag ? cords.long : dot.long, zoom: 16})
    }, [cords, dot])

    useMemo(() => {
        let latest = points.length === 0 ? cords : points[points.length - 1]?.dot
        let score = centum.haversine([latest.lat, latest.long, dot.lat, dot.long], 0)

        setPoint({...point, score})
    }, [dot])

    const onPoint = () => {
        if (points.find(el => centum.search(el.label, label, 100)) === undefined) {
            setState({...state, points: [...points, point], distance: distance + score})
        }

        setPoint({
            id: shortid.generate().toString(),
            label: '',
            surface: SURFACES[0],
            score: 0,
            dot
        })
    }

    const onCreate = () => {
        createItinerary({
            variables: {
                username: context.username, id: params.id, title, category, level, region, cords, points, distance
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Новый Маршрут' num={idx} setNum={setIdx} items={[
                    <>
                        <h3 className='pale'>Название</h3>
                        <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Введите имя маршрута' type='text' />
                        
                        <h3 className='pale'>Местность и сложность</h3>
                       
                        <div className='items small'>
                            {ITINERARY_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                    
                        <select value={level} onChange={e => setState({...state, level: e.target.value})}>
                            {LEVELS.map(el => <option value={el}>{el}</option>)}
                        </select>                               
                    </>,
            
                    <>
                        <h3 className='pale'>Укажите точку на карте</h3>

                        <button onClick={() => setIsStartFlag(false)} className='light-btn'>{isStartFlag ? 'Начало' : 'Флаг'}</button>

                        {isStartFlag ?
                                <>
                                    <h3 className='pale'>Где находится старт?</h3>
                                    <input value={region} onChange={e => setState({...state, region: e.target.value})} placeholder='Ближайший город' type='text' />
                                </>
                            :
                                <>
                                    <h3 className='pale'>Название и тип точки</h3>
                                    <input value={label} onChange={e => setPoint({...point, label: e.target.value})} placeholder='Название точки' type='text' />
                                    <select value={surface} onChange={e => setPoint({...point, surface: e.target.value})}>
                                        {SURFACES.map(el => <option value={el}>{el}</option>)}
                                    </select>
                                    <button onClick={onPoint}>Добавить</button>
                                </>
                        }
                        
                        <h3 className='pale'>Дистанция: <b>{distance}</b> метров</h3>
                        <ReactMapGL onClick={e => isStartFlag ? setState({...state, cords: centum.mapboxCords(e)}) : setPoint({...point, dot: centum.mapboxCords(e)})} {...view} 
                            onViewportChange={(e: any) => setView(e)}
                            mapboxApiAccessToken={token}
                        >
                            <Marker latitude={cords.lat} longitude={cords.long}>
                                <MapPicker type='home' />
                            </Marker>
                            <Marker latitude={dot.lat} longitude={dot.long}>
                                <MapPicker type='picker' />
                            </Marker>
                            
                            {points.map(el => 
                                <Marker latitude={el.dot.lat} longitude={el.dot.long}>
                                    <MapPicker type='picker' />
                                </Marker>  
                            )}
                        </ReactMapGL>  
                    </>
                ]} 
            />

            <button onClick={onCreate}>Создать</button>
        </div>
    )
}

export default CreateItinerary