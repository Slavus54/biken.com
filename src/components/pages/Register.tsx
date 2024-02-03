import {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import {weekdays_titles} from 'datus.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import ImageLoader from '../UI&UX/ImageLoader'
import MapPicker from '../UI&UX/MapPicker'
import FormPagination from '../UI&UX/FormPagination'
import {TownType} from '../../types/types'

const Register = () => {
    const {change_context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [image, setImage] = useState<string>('')
    const [idx, setIdx] = useState<number>(0)
    const [state, setState] = useState({
        username: '', 
        security_code: '', 
        telegram: '',
        weekday: weekdays_titles[0],
        region: towns[0].title, 
        cords: towns[0].cords
    })

    const centum = new Centum()

    const {username, security_code, telegram, weekday, region, cords} = state

    const registerM = gql`
        mutation register($username: String!, $security_code: String!, $telegram: String!, $weekday: String!, $region: String!, $cords: ICord!, $main_photo: String!) {
            register(username: $username, security_code: $security_code, telegram: $telegram, weekday: $weekday, region: $region, cords: $cords, main_photo: $main_photo) {
                account_id
                username
                weekday
            }
        }
    `

    const [register] = useMutation(registerM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.register)
            change_context('update', data.register, 1)
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
        register({
            variables: {
                username, security_code, telegram, weekday, region, cords, main_photo: image
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Новый Аккаунт' num={idx} setNum={setIdx} items={[
                    <>
                        
                        <h3 className='pale'>Полное имя</h3>
                        <input value={username} onChange={e => setState({...state, username: e.target.value})} placeholder='Введите имя' type='text' />
                
                        <h3 className='pale'>Защита аккаунта</h3>
                        <input value={security_code} onChange={e => setState({...state, security_code: e.target.value})} placeholder='Код безопасности' type='text' />                                               
                    </>,
                    <>
                        <h3 className='pale'>Дополнительная информация</h3>
                        <input value={telegram} onChange={e => setState({...state, telegram: e.target.value})} placeholder='Telegram tag' type='text' />
                        <ImageLoader setImage={setImage} />
                        <h3 className='pale'>День променажа</h3>
                        <div className='items small'>
                            {weekdays_titles.map(el => <div onClick={() => setState({...state, weekday: el})} className={el === weekday ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                    </>,
                    <>
                        <h3 className='pale'>Где вы находитесь?</h3>
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

export default Register