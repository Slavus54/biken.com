import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {RELATIVE_TYPES, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import {Datus} from 'datus.js'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import MapPicker from '../UI&UX/MapPicker'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import QuantityLabel from '../UI&UX/QuantityLabel'
import DataPagination from '../UI&UX/DataPagination'
import CloseIt from '../UI&UX/CloseIt'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType, Cords} from '../../types/types'

const Itinerary: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [cords, setCords] = useState<Cords>({lat: 0, long: 0})
    const [image, setImage] = useState<string>('')
    const [speed, setSpeed] = useState<number>(16)
    const [races, setRaces] = useState<any[]>([])
    const [invites, setInvites] = useState<any[]>([])
    const [race, setRace] = useState<any | null>(null)
    const [itinerary, setItinerary] = useState<any | null>(null)
    const [state, setState] = useState({
        latest_bike: '',
        text: '',
        fullname: '',
        category: RELATIVE_TYPES[0],
        percent: 50
    })

    const {latest_bike, text, fullname, category, percent} = state

    const centum = new Centum()
    const datus = new Datus()

    const getItineraryM = gql`
        mutation getItinerary($username: String!, $shortid: String!) {
            getItinerary(username: $username, shortid: $shortid) {
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
    
    const updateItineraryBikeM = gql`
        mutation updateItineraryBike($username: String!, $id: String!, $latest_bike: String!) {
            updateItineraryBike(username: $username, id: $id, latest_bike: $latest_bike) 
        }
    `

    const makeItineraryInviteM = gql`
        mutation makeItineraryInvite($username: String!, $id: String!, $fullname: String!, $category: String!, $percent: Float!, $dateUp: String!) {
            makeItineraryInvite(username: $username, id: $id, fullname: $fullname, category: $category, percent: $percent, dateUp: $dateUp) 
        }
    `

    const manageItineraryRaceM = gql`
        mutation manageItineraryRace($username: String!, $id: String!, $option: String!, $text: String!, $speed: Float!, $image: String!, $coll_id: String!) {
            manageItineraryRace(username: $username, id: $id, option: $option, text: $text, speed: $speed, image: $image, coll_id: $coll_id)
        }
    `

    const [manageItineraryRace] = useMutation(manageItineraryRaceM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageItineraryRace)
            window.location.reload()
        }
    })

    const [makeItineraryInvite] = useMutation(makeItineraryInviteM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.makeItineraryInvite)
            window.location.reload()
        }
    })

    const [updateItineraryBike] = useMutation(updateItineraryBikeM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateItineraryBike)
            window.location.reload()
        }
    })

    const [getItinerary] = useMutation(getItineraryM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getItinerary)
            setItinerary(data.getItinerary)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getItinerary({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (itinerary !== null) {
            setCords(itinerary.cords)
            setState({...state, latest_bike: itinerary.latest_bike})
        }
    }, [itinerary])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 16})
    }, [cords])

    const onManageRace = (option: string) => {
        manageItineraryRace({
            variables: {
                username: context.username, id: params.id, option, text, speed, image, coll_id: race === null ? '' : race.shortid
            }
        })
    }

    const onUpdateBike = () => {
        updateItineraryBike({
            variables: {
                username: context.username, id: params.id, latest_bike
            }
        })
    }

    const onMakeInvite = () => {
        makeItineraryInvite({
            variables: {
                username: context.username, id: params.id, fullname, category, percent, dateUp: datus.move()
            }
        })
    }

    return (
        <>          
            {itinerary !== null &&
                <>
                    <h1>{itinerary.title}</h1>
                    
                    <div className='items small'>
                        <h4 className='pale'>Местность: {itinerary.category}</h4>
                        <h4 className='pale'>Сложность: {itinerary.level}</h4>
                    </div>

                    <NavigatorWrapper id={itinerary.account_id} isRedirect={true}>
                        <button className='light-btn'>Автор</button>
                    </NavigatorWrapper>

                    <h2>Последний байк на маршруте</h2>
                    <input value={latest_bike} onChange={e => setState({...state, latest_bike: e.target.value})} placeholder='Название велосипеда' type='text' />
                    <button onClick={onUpdateBike}>Обновить</button>

                    <h4 className='pale'>Дистанция: <b>{itinerary.distance}</b> метров</h4>
                    <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                        <Marker latitude={cords.lat} longitude={cords.long}>
                            <MapPicker type='home' />
                        </Marker>
                        
                        {itinerary.points.map(el => 
                            <Marker latitude={el.dot.lat} longitude={el.dot.long}>
                                <MapPicker type='picker' />
                            </Marker>
                        )}
                    </ReactMapGL>

                    {race === null ? 
                            <>
                                <h2>Новый заезд</h2>
                                <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Ваши впечатления...' />
                                <QuantityLabel num={speed} setNum={setSpeed} part={2} min={16} max={32} label={`Скорость: ${speed} км/ч`} />
                                <ImageLoader setImage={setImage} />

                                <button onClick={() => onManageRace('create')}>Создать</button>

                                <DataPagination initialItems={itinerary.races} setItems={setRaces} label='Текущие заезды:' />
                                <div className='items half'>
                                    {races.map(el => 
                                        <div onClick={() => setRace(el)} className='item card'>
                                            {centum.shorter(el.text)}
                                        </div>
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setRace(null)} />
                                {race.image !== '' && <ImageLook src={race.image} className='photo_item' alt='race photo' />}
                                <h2>{race.text}</h2>

                                <div className='items small'>
                                    <h4 className='pale'>Скорость: {race.speed} км/ч</h4>
                                    <h4 className='pale'>Уважение: <b>{race.respect}</b></h4>
                                </div>
                                
                                {context.username === race.name ?
                                        <button onClick={() => onManageRace('delete')}>Удалить</button>
                                    :
                                        <button onClick={() => onManageRace('respect')}>Респект</button>
                                }
                            </>
                    }

                    <h2>С кем вы катались?</h2>
                    <input value={fullname} onChange={e => setState({...state, fullname: e.target.value})} placeholder='Полное имя' type='text' />
                    <select value={category} onChange={e => setState({...state, category: e.target.value})}>
                        {RELATIVE_TYPES.map(el => <option value={el}>{el}</option>)}
                    </select>  

                    <p>Проехали {percent}% пути</p>
                    <input value={percent} onChange={e => setState({...state, percent: parseInt(e.target.value)})} type='range' step={1} />

                    <button onClick={onMakeInvite}>Опубликовать</button>

                    <DataPagination initialItems={itinerary.invites} setItems={setInvites} label='Совместные заезды:' />
                    <div className='items half'>
                        {invites.map(el => 
                            <div className='item panel'>
                                {centum.shorter(el.fullname)}
                                <div className='items small'>
                                    <h5 className='pale'>{el.category}</h5>
                                    <h5 className='pale'>{el.dateUp}</h5>
                                </div>
                            </div>
                        )}
                    </div>
                </>                  
            }  
        
            {itinerary === null && <Loading />} 
        </>
    )
}

export default Itinerary