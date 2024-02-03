import {useState, useMemo} from 'react';
import {useMutation, gql} from '@apollo/react-hooks'
import {BICYCLE_TYPES, BICYCLE_STATUSES} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import DataPagination from '../UI&UX/DataPagination'
import CloseIt from '../UI&UX/CloseIt'
import {AccountPageComponentProps} from '../../types/types'

const ProfileBicycles = ({profile, context}: AccountPageComponentProps) => {
    const [bicycles, setBicycles] = useState<any[] | null>([])
    const [bicycle, setBicycle] = useState<any | null>(null)
    const [distance, setDistance] = useState<number>(10)
    const [image, setImage] = useState<string>('')
    const [state, setState] = useState({
        title: '', 
        category: BICYCLE_TYPES[0], 
        status: BICYCLE_STATUSES[0], 
        mileage: 0,
        weekday: profile.weekday
    })

    const centum = new Centum()

    const {title, category, status, mileage, weekday} = state

    const manageProfileBicycleM = gql`
        mutation manageProfileBicycle($account_id: String!, $option: String!, $title: String!, $category: String!, $status: String!, $mileage: Float!, $image: String!, $coll_id: String!) {
            manageProfileBicycle(account_id: $account_id, option: $option, title: $title, category: $category, status: $status, mileage: $mileage, image: $image, coll_id: $coll_id)
        }
    `

  

    const [manageProfileBicycle] = useMutation(manageProfileBicycleM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageProfileBicycle)
            window.location.reload()
        }
    })

    useMemo(() => {
        if (bicycle !== null) {
            setState({...state, status: bicycle.status, mileage: bicycle.mileage})
            setImage(bicycle.image) 
            setDistance(0) 
        } else {
            setImage('')
        }
    }, [bicycle])

    useMemo(() => {
        if (bicycle !== null) {
            let result = centum.part(distance, 20, 1)

            setState({...state, mileage: bicycle.mileage + result})
        }
    }, [distance])
    
    const onManageBicycle = (option: string) => {
        manageProfileBicycle({
            variables: {
                account_id: context.account_id, option, title, category, status, mileage, image, coll_id: bicycle === null ? '' : bicycle.shortid
            }
        })
    } 

   

    return (
        <>
            {bicycle === null ? 
                    <>
                        <h2>Новый велосипед</h2>
                        <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Название аппарата' type='text' />
                        <h4 className='pale'>День променажа</h4>
                        <div className='items small'>
                            {BICYCLE_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                        <select value={status} onChange={e => setState({...state, status: e.target.value})}>
                            {BICYCLE_STATUSES.map(el => <option value={el}>{el}</option>)}
                        </select>

                        <ImageLoader setImage={setImage} />

                        <button onClick={() => onManageBicycle('create')}>Добавить</button>

                        <DataPagination initialItems={profile.bicycles} setItems={setBicycles} label='Мой гараж:' />
                        <div className='items half'>
                            {bicycles.map(el => 
                                <div onClick={() => setBicycle(el)} className='item card'>
                                    {centum.shorter(el.title)}
                                </div>
                            )}
                        </div>
                    </>
                :
                    <>
                        <CloseIt onClick={() => setBicycle(null)} />
                        {image !== '' && <ImageLook src={image} className='photo_item' alt='bicycle photo' />}
                        <h2>{bicycle.title}</h2>

                        <div className='items small'>
                            <h4 className='pale'>Тип: {bicycle.category}</h4>
                            <h4 className='pale'><b>{bicycle.likes}</b> лайков</h4>
                        </div>

                        <p>Пробег: {mileage} км</p>
                        <input value={distance} onChange={e => setDistance(parseInt(e.target.value))} type='range' step={1} />

                        <select value={status} onChange={e => setState({...state, status: e.target.value})}>
                            {BICYCLE_STATUSES.map(el => <option value={el}>{el}</option>)}
                        </select>

                        <ImageLoader setImage={setImage} />

                        <div className='items small'>
                            <button onClick={() => onManageBicycle('delete')}>Удалить</button>
                            <button onClick={() => onManageBicycle('update')}>Обновить</button>
                        </div>
                    </>
            }
        </> 
    )
}

export default ProfileBicycles