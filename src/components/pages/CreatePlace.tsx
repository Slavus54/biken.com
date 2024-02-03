import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {PLACE_TYPES, SURFACES, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import ImageLoader from '../UI&UX/ImageLoader'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType, TownType} from '../../types/types'

const CreatePlace: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [idx, setIdx] = useState<number>(0)
    const [image, setImage] = useState<string>('')
    const [state, setState] = useState({
        title: '', 
        category: PLACE_TYPES[0], 
        surface: SURFACES[0],
        region: towns[0].title, 
        cords: towns[0].cords
    })

    const centum = new Centum()

    const {title, category, surface, region, cords} = state

    const createPlaceM = gql`
        mutation createPlace($username: String!, $id: String!, $title: String!, $category: String!, $surface: String!, $region: String!, $cords: ICord!, $image: String!) {
            createPlace(username: $username, id: $id, title: $title, category: $category, surface: $surface, region: $region, cords: $cords, image: $image)
        }
    `

    const [createPlace] = useMutation(createPlaceM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createPlace)
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
        createPlace({
            variables: {
                username: context.username, id: params.id, title, category, surface, region, cords, image
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Новое Место' num={idx} setNum={setIdx} items={[
                    <>
                        <h3 className='pale'>Наименование</h3>
                        <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Название места' type='text' />

                        <h3 className='pale'>Вид</h3>
                        <div className='items small'>
                            {PLACE_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>   

                        <select value={surface} onChange={e => setState({...state, surface: e.target.value})}>
                            {SURFACES.map(el => <option value={el}>{el}</option>)}
                        </select>                   

                        <ImageLoader setImage={setImage} />
                    </>,
                    <>
                        <h3 className='pale'>Где находится?</h3>
                        <input value={region} onChange={e => setState({...state, region: e.target.value})} placeholder='Ближайший город' type='text' />
                
                        <ReactMapGL onClick={e => setState({...state, cords: centum.mapboxCords(e)})} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                            <Marker latitude={cords.lat} longitude={cords.long}>
                                <MapPicker type='picker' />
                            </Marker>
                        </ReactMapGL>  
                    </>
                ]} 
            />

            <button onClick={onCreate}>Создать</button>
        </div>
    )
}

export default CreatePlace