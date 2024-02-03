import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {LOCATION_TYPES, PLATFORMS, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import {Datus} from 'datus.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import DataPagination from '../UI&UX/DataPagination'
import CloseIt from '../UI&UX/CloseIt'
import LikeButton from '../UI&UX/LikeButton'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType, TownType, Cords} from '../../types/types'

const Trick: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [image, setImage] = useState<string>('')
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<Cords>(towns[0].cords)
    const [locations, setLocations] = useState<any[]>([])
    const [videos, setVideos] = useState<any[]>([])
    const [step, setStep] = useState<any | null>(null)
    const [location, setLocation] = useState<any | null>(null)
    const [video, setVideo] = useState<any | null>(null)
    const [trick, setTrick] = useState(null)
    const [state, setState] = useState({
        content: '',
        text: '',
        format: LOCATION_TYPES[0],
        title: '',
        category: PLATFORMS[0],
        url: '',
        stars: 0
    })

    const centum = new Centum()
    const datus = new Datus()

    const {content, text, format, title, category, url, stars} = state

    const getTrickM = gql`
        mutation getTrick($username: String!, $shortid: String!) {
            getTrick(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                title
                category
                level
                bicycles
                max_speed
                steps {
                    id
                    content
                    dateUp
                }
                stars
                locations {
                    shortid
                    name
                    text
                    format
                    image
                    cords {
                        lat
                        long
                    }
                }
                videos {
                    shortid
                    name
                    title
                    category
                    url
                    likes
                }
            }
        }
    `

    const makeTrickLocationM = gql`
        mutation makeTrickLocation($username: String!, $id: String!, $text: String!, $format: String!, $image: String!, $cords: ICord!) {
            makeTrickLocation(username: $username, id: $id, text: $text, format: $format, image: $image, cords: $cords)
        }
    `

    const updateTrickStepM = gql`
        mutation updateTrickStep($username: String!, $id: String!, $content: String!, $dateUp: String!, $coll_id: String!) {
            updateTrickStep(username: $username, id: $id, content: $content, dateUp: $dateUp, coll_id: $coll_id)
        }
    `

    const updateTrickRatingM = gql`
        mutation updateTrickRating($username: String!, $id: String!, $stars: Float!) {
            updateTrickRating(username: $username, id: $id, stars: $stars)
        }
    `

    const manageTrickVideoM = gql`
        mutation manageTrickVideo($username: String!, $id: String!, $option: String!, $title: String!, $category: String!, $url: String!, $coll_id: String!) {
            manageTrickVideo(username: $username, id: $id, option: $option, title: $title, category: $category, url: $url, coll_id: $coll_id)
        }
    `

    const [manageTrickVideo] = useMutation(manageTrickVideoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageTrickVideo)
            window.location.reload()
        }
    })

    const [updateTrickRating] = useMutation(updateTrickRatingM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateTrickRating)
            window.location.reload()
        }
    })

    const [updateTrickStep] = useMutation(updateTrickStepM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateTrickStep)
            window.location.reload()
        }
    })

    const [makeTrickLocation] = useMutation(makeTrickLocationM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.makeTrickLocation)
            window.location.reload()
        }
    })

    const [getTrick] = useMutation(getTrickM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getTrick)
            setTrick(data.getTrick)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getTrick({
                variables: {
                    username: context.username, shortid: params.id
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
        if (trick !== null) {
            setState({...state, stars: trick.stars})
        }
    }, [trick])

    useMemo(() => {
        setState({...state, content: step === null ? '' : step.content})
    }, [step])

    const onView = () => {
        window.open(video.url)
    }

    const onMakeLocation = () => {
        makeTrickLocation({
            variables: {
                username: context.username, id: params.id, text, format, image, cords
            }
        })
    }

    const onUpdateStep = () => {
        updateTrickStep({
            variables: {
                username: context.username, id: params.id, content, dateUp: datus.move(), coll_id: step.id
            }
        })
    }

    const onGiveStars = () => {
        updateTrickRating({
            variables: {
                username: context.username, id: params.id, stars
            }
        })
    }

    const onManageVideo = (option: string) => {
        manageTrickVideo({
            variables: {
                username: context.username, id: params.id, option, title, category, url, coll_id: video === null ? '' : video.shortid
            }
        })
    } 

    return (
        <>          
            {trick !== null &&
                <>
                    <h1>{trick.title}</h1>

                    <div className='items small'>
                        <h4 className='pale'>Тип: {trick.category}</h4>
                        <h4 className='pale'>Макс. скорость: {trick.max_speed} км/ч</h4>
                    </div>

                    <div onClick={() => setState({...state, stars: stars + 1})} className='item label'>{stars} звёзд</div>
                    {trick.stars !== stars && <button onClick={onGiveStars} className='light-btn'>Оценить</button>}

                    {location === null ? 
                            <>
                                <h2>Место для трюка</h2>

                                <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Опишите место...' />
                          
                                <select value={format} onChange={e => setState({...state, format: e.target.value})}>
                                    {LOCATION_TYPES.map(el => <option value={el}>{el}</option>)}
                                </select>

                                <ImageLoader setImage={setImage} />

                                <h4 className='pale'>Где находится?</h4>
                                <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Ближайший город' type='text' />                                

                                <button onClick={onMakeLocation}>Добавить</button>
                                <DataPagination initialItems={trick.locations} setItems={setLocations} label='Лучшие места на карте:' />
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setLocation(null)} />
                                {location.image !== '' && <ImageLook src={location.image} className='photo_item' alt='location photo' />}
                                
                                <h2>{location.text}</h2>
                                <h4 className='pale'>{location.format}</h4>
                            </>
                    }
                    <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                        <Marker latitude={cords.lat} longitude={cords.long}>
                            <MapPicker type='picker' />
                        </Marker>
                        
                        {locations.map(el =>
                            <Marker onClick={() => setLocation(el)} latitude={el.cords.lat} longitude={el.cords.long}>
                                {centum.shorter(el.text)}
                            </Marker>
                        )}
                    </ReactMapGL>  

                    {step === null ? 
                            <>
                                <h2>Шаги выполнения</h2>
                                <div className='items half'>
                                    {trick.steps.map(el => 
                                        <div onClick={() => setStep(el)} className='item panel'>
                                            {centum.shorter(el.content)}
                                        </div>    
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setStep(null)} />
                                <h2>Шаг</h2>
                                <textarea value={content} onChange={e => setState({...state, content: e.target.value})} placeholder='Опишите это...' />

                                <button onClick={onUpdateStep} className='light-btn'>Обновить</button>
                            </>
                    }

                    {video === null ?
                            <>
                                <h2>Новое видео</h2>
                                <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Название видео' type='text' />

                                <input value={url} onChange={e => setState({...state, url: e.target.value})} placeholder='URL' type='text' />
                                
                                <select value={category} onChange={e => setState({...state, category: e.target.value})}>
                                    {PLATFORMS.map(el => <option value={el}>{el}</option>)}
                                </select>

                                <button onClick={() => onManageVideo('create')}>Опубликовать</button>

                                <DataPagination initialItems={trick.videos} setItems={setVideos} label='Съёмка трюка:' />
                                <div className='items half'>
                                    {videos.map(el => 
                                        <div onClick={() => setVideo(el)} className='item card'>
                                            {centum.shorter(el.title)}
                                            <h5 className='pale'>{el.category}</h5>
                                        </div>    
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setVideo(null)} />

                                <h2>{video.title}</h2>

                                <button onClick={onView} className='light-btn'>Смотреть</button>

                                <div className='items small'>
                                    <h4 className='pale'>Платформа: {video.category}</h4>
                                    <h4 className='pale'><b>{video.likes}</b> лайков</h4>
                                </div>

                                {video.name === context.username ? 
                                        <button onClick={() => onManageVideo('delete')}>Удалить</button>
                                    :
                                        <LikeButton onClick={() => onManageVideo('like')} />
                                }
                            </>
                    }
                </> 
            }  
        
            {trick === null && <Loading />} 
        </>
    )
}

export default Trick