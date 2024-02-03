import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {useDispatch} from 'react-redux'
import {INFRASTRUCTURE_TYPES, LEVELS, GOOGLE_MAP_ICON, ROUTE_ICON, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {addRouteWaypoint} from '../../store/slices/RouteSlice'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import DataPagination from '../UI&UX/DataPagination'
import CloseIt from '../UI&UX/CloseIt'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType, Cords, Waypoint} from '../../types/types'

const Place: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [image, setImage] = useState<string>('')
    const [points, setPoints] = useState<number>(0)
    const [cords, setCords] = useState<Cords>({lat: 0, long: 0})
    const [infrastructures, setInfrastructures] = useState<any[]>([])
    const [infrastructure, setInfrastructure] = useState<any | null>(null)
    const [question, setQuestion] = useState<any | null>(null)
    const [place, setPlace] = useState(null)
    const [state, setState] = useState({
        text: '',
        level: LEVELS[0],
        answer: '',
        title: '',
        category: INFRASTRUCTURE_TYPES[0],
        distance: 0,
        rating: 50
    })

    const centum = new Centum()
    const dispatch = useDispatch()

    const {text, level, answer, title, category, distance, rating} = state

    const getPlaceM = gql`
        mutation getPlace($username: String!, $shortid: String!) {
            getPlace(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                title
                category
                surface
                region
                cords {
                    lat
                    long
                }
                image
                questions {
                    shortid
                    name
                    text
                    level
                    answer
                }
                infrastructures {
                    shortid
                    name
                    title
                    category
                    distance
                    rating
                }
            }
        }
    `

    const updatePlacePhotoM = gql`
        mutation updatePlacePhoto($username: String!, $id: String!, $image: String!) {
            updatePlacePhoto(username: $username, id: $id, image: $image) 
        }
    `

    const makePlaceQuestionM = gql`
        mutation makePlaceQuestion($username: String!, $id: String!, $text: String!, $level: String!, $answer: String!) {
            makePlaceQuestion(username: $username, id: $id, text: $text, level: $level, answer: $answer) 
        }
    `

    const managePlaceInfrastructureM = gql`
        mutation managePlaceInfrastructure($username: String!, $id: String!, $option: String!, $title: String!, $category: String!, $distance: Float!, $rating: Float!, $coll_id: String!) {
            managePlaceInfrastructure(username: $username, id: $id, option: $option, title: $title, category: $category, distance: $distance, rating: $rating, coll_id: $coll_id) 
        }
    `

    const [managePlaceInfrastructure] = useMutation(managePlaceInfrastructureM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.managePlaceInfrastructure)
            window.location.reload()
        }
    })

    const [makePlaceQuestion] = useMutation(makePlaceQuestionM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.makePlaceQuestion)
            window.location.reload()
        }
    })

    const [updatePlacePhoto] = useMutation(updatePlacePhotoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updatePlacePhoto)
            window.location.reload()
        }
    })

    const [getPlace] = useMutation(getPlaceM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getPlace)
            setPlace(data.getPlace)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getPlace({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (place !== null) {
            setImage(place.image)
            setCords(place.cords)
        }
    }, [place])

    useMemo(() => {
        if (place !== null) {
            let result: number = centum.haversine([place.cords.lat, place.cords.long, cords.lat, cords.long], 1)
        
            setState({...state, distance: result})
            setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 16})
        }
    }, [cords])

    useMemo(() => {
        setState({...state, answer: ''})
    }, [question])

    useMemo(() => {
        setState({...state, rating: infrastructure === null ? 50 : infrastructure.rating})
    }, [infrastructure])

    const onView = () => {
        centum.go(`https://www.google.ru/maps/@${place.cords.lat},${place.cords.long},200m/data=!3m1!1e3?entry=ttu`)
    }

    const onQuestion = () => {
        if (question === null) {
            let result = centum.random(place.questions)?.value

            if (result !== undefined) {
                setQuestion(result)
            }
        } else {
            let award = LEVELS.indexOf(question.level) + 1

            if (answer === question.answer) {
                setPoints(points + award)
            }

            setQuestion(null)
        }
    }

    const onUpdateRoute = () => {
        let data: Waypoint = {shortid: place.shortid, title: place.title, category: place.category, surface: place.surface, cords: place.cords} 

        dispatch(addRouteWaypoint(data))
    }

    const onMakeQuestion = () => {
        makePlaceQuestion({
            variables: {
                username: context.username, id: params.id, text, level, answer
            }
        })
    }

    const onUpdatePhoto = () => {
        updatePlacePhoto({
            variables: {
                username: context.username, id: params.id, image
            }
        })
    }

    const onManageInfrastructure = (option: string) => {
        managePlaceInfrastructure({
            variables: {
                username: context.username, id: params.id, option, title, category, distance, rating, coll_id: infrastructure === null ? '' : infrastructure.shortid 
            }
        })
    }

    return (
        <>          
            {place !== null &&
                <>
                    {image !== '' && <ImageLook src={image} className='photo_item' alt='place photo' />}
                  
                    <h1>{place.title}</h1>

                    <div className='items small'>
                        <h4 className='pale'>Вид: {place.category}</h4>
                        <h4 className='pale'>Поверхность: {place.surface}</h4>
                    </div>

                    <div className='items little'>
                        <ImageLook onClick={onView} src={GOOGLE_MAP_ICON} min={2} max={2} className='icon' />
                        <ImageLook onClick={onUpdateRoute} src={ROUTE_ICON} min={2} max={2} className='icon' />
                    </div>
         
                    <h2>У вас есть фотография?</h2>
                    <ImageLoader setImage={setImage} />
                    <button onClick={onUpdatePhoto} className='light-btn'>Обновить</button>

                    {infrastructure === null ? 
                            <>
                                <h2>Объект инфраструктуры</h2>
                                <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Название объекта' type='text' />
                                
                                <h4 className='pale'>Тип</h4>
                                <div className='items small'>
                                    {INFRASTRUCTURE_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                                </div>  

                                <h4 className='pale'>Рейтинг: <b>{rating}%</b></h4>
                                <input value={rating} onChange={e => setState({...state, rating: parseInt(e.target.value)})} type='range' step={1} />

                                <button onClick={() => onManageInfrastructure('create')}>Добавить</button>

                                <h4 className='pale'>Расстояние от места: <b>{distance}</b> метров</h4>
                                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                                    <Marker latitude={place.cords.lat} longitude={place.cords.long}>
                                        <MapPicker type='home' />
                                    </Marker>
                                    <Marker latitude={cords.lat} longitude={cords.long}>
                                        <MapPicker type='picker' />
                                    </Marker>
                                </ReactMapGL> 

                                <DataPagination initialItems={place.infrastructures} setItems={setInfrastructures} label='Инфраструктура:' />
                                <div className='items half'>
                                    {infrastructures.map(el => 
                                        <div onClick={() => setInfrastructure(el)} className='item panel'>
                                            {centum.shorter(el.title)}
                                            <h5 className='pale'>{el.category}</h5>
                                        </div>
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setInfrastructure(null)} />

                                <h2>{infrastructure.title}</h2>

                                <div className='items small'>
                                    <h4 className='pale'>Тип: {infrastructure.category}</h4>
                                    <h4 className='pale'>Растоние от места: <b>{infrastructure.distance}</b> метров</h4>
                                </div>

                                {infrastructure.name === context.username ? 
                                        <button onClick={() => onManageInfrastructure('delete')}>Удалить</button>   
                                    :
                                        <>
                                            <h4 className='pale'>Рейтинг: <b>{rating}%</b></h4>
                                            <input value={rating} onChange={e => setState({...state, rating: parseInt(e.target.value)})} type='range' step={1} />

                                            <button onClick={() => onManageInfrastructure('update')}>Обновить</button>
                                        </>
                                }
                            </>
                    }                

                    {question === null ? 
                            <>
                                <h2>Узнайте новое о месте</h2>
                                <h4 className='pale'>Очки: {points}</h4>
                                <button onClick={onQuestion} className='light-btn'>Сгенерировать</button>

                                <h2>Новый Вопрос</h2>
                                <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Ваша формулировка...' />

                                <h4 className='pale'>Ваш Ответ</h4>
                                <input value={answer} onChange={e => setState({...state, answer: e.target.value})} placeholder='Ответ на вопрос' type='text' />

                                <select value={level} onChange={e => setState({...state, level: e.target.value})}>
                                    {LEVELS.map(el => <option value={el}>{el}</option>)}
                                </select>      

                                <button onClick={onMakeQuestion}>Опубликовать</button>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setQuestion(null)} />

                                <h2>{question.text}?</h2>

                                <h4 className='pale'>Ваш Ответ</h4>
                                <input value={answer} onChange={e => setState({...state, answer: e.target.value})} placeholder='Ответ на вопрос' type='text' />
                                <button onClick={onQuestion} className='light-btn'>Проверить</button>
                            </>
                    }
                </>
            }  
        
            {place === null && <Loading />} 
        </>
    )
}

export default Place