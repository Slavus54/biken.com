import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {BICYCLE_TYPES, SPEEDS, COUNTRIES, WHEEL_MIN_LIMIT, WHEEL_MAX_LIMIT, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import ImageLoader from '../UI&UX/ImageLoader'
import QuantityLabel from '../UI&UX/QuantityLabel'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType, TownType} from '../../types/types'

const CreateBike: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [idx, setIdx] = useState<number>(0)
    const [wheel_size, setWheelSize] = useState<number>(WHEEL_MIN_LIMIT)
    const [image, setImage] = useState<string>('')
    const [state, setState] = useState({
        title: '', 
        category: BICYCLE_TYPES[0], 
        speeds: SPEEDS[0],
        country: COUNTRIES[0],
        phone: '',
        cost: 1000,
        region: towns[0].title, 
        cords: towns[0].cords
    })

    const centum = new Centum()

    const {title, category, speeds, country, phone, cost, region, cords} = state

    const createBikeM = gql`
        mutation createBike($username: String!, $id: String!, $title: String!, $category: String!, $speeds: Float!, $wheel_size: Float!, $country: String!, $phone: String!, $cost: Float!, $image: String!, $region: String!, $cords: ICord!) {
            createBike(username: $username, id: $id, title: $title, category: $category, speeds: $speeds, wheel_size: $wheel_size, country: $country, phone: $phone, cost: $cost, image: $image, region: $region, cords: $cords) 
        }
    `

    const [createBike] = useMutation(createBikeM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createBike)
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
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 16})
    }, [cords])

    const onCreate = () => {
        createBike({
            variables: {
                username: context.username, id: params.id, title, category, speeds, wheel_size, country, phone: centum.phone(phone), cost, image, region, cords
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Новый Велосипед' num={idx} setNum={setIdx} items={[
                    <>
                        <div className='items small'>
                            <div className='item'>
                                <h3 className='pale'>Название</h3>
                                <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Наименование велосипеда' type='text' />
                            </div>

                            <div className='item'>
                                <h3 className='pale'>Стартовая цена</h3>
                                <input value={cost} onChange={e => setState({...state, cost: parseInt(e.target.value)})} placeholder='Цена велосипеда' type='text' />
                            </div>
                        </div>
                        
                        <h3 className='pale'>Тип и производитель</h3>
                       
                        <div className='items small'>
                            {BICYCLE_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                    
                        <select value={country} onChange={e => setState({...state, country: e.target.value})}>
                            {COUNTRIES.map(el => <option value={el}>{el}</option>)}
                        </select>                               
                    </>,
                    <>
                        <h3 className='pale'>Кол-во скоростей и размер колеса</h3>
                        <div className='items small'>
                            {SPEEDS.map(el => <div onClick={() => setState({...state, speeds: el})} className={el === speeds ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                        <QuantityLabel num={wheel_size} setNum={setWheelSize} part={1} min={WHEEL_MIN_LIMIT} max={WHEEL_MAX_LIMIT} label={`Диаметр: ${wheel_size}″`} />
                        <ImageLoader setImage={setImage} />
                    </>,
                    <>
                        <div className='items small'>   
                            <div className='item'>
                                <h3 className='pale'>Где находится?</h3>
                                <input value={region} onChange={e => setState({...state, region: e.target.value})} placeholder='Ближайший город' type='text' />
                            </div>

                            <div className='item'>
                                <h3 className='pale'>Как связаться?</h3>
                                <input value={phone} onChange={e => setState({...state, phone: e.target.value})} placeholder='Номер телефона' type='text' />
                            </div>
                        </div>
                        <ReactMapGL onClick={e => setState({...state, cords: centum.mapboxCords(e)})} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                            <Marker latitude={cords.lat} longitude={cords.long}>
                                <MapPicker type='picker' />
                            </Marker>
                        </ReactMapGL>  
                    </>
                ]} 
            />

            {isNaN(cost) ? <button onClick={() => setState({...state, cost: 1000})}>Сбросить</button> : <button onClick={onCreate}>Создать</button>}
        </div>
    )
}

export default CreateBike