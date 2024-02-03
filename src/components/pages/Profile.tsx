import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import ProfilePhoto from '../../assets/profile_photo.jpg'
import {VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import {Datus} from 'datus.js'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import DataPagination from '../UI&UX/DataPagination'
import ImageLook from '../UI&UX/ImageLook'
import CloseIt from '../UI&UX/CloseIt'
import LikeButton from '../UI&UX/LikeButton'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType} from '../../types/types'

const Profile: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [profile, setProfile] = useState(null)
    const datus = new Datus()
    const [dates] = useState<string[]>(datus.dates('week', 3, context.weekday))
    const [msg, setMsg] = useState<string>('') 
    const [date, setDate] = useState<string>('') 
    const [image, setImage] = useState<string>('') 
    const [bicycles, setBicycles] = useState<any[]>([])
    const [bicycle, setBicycle] = useState<any | null>(null)

    const centum = new Centum()

    const getProfileM = gql`
        mutation getProfile($account_id: String!) {
            getProfile(account_id: $account_id) {
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

    const [getProfile] = useMutation(getProfileM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProfile)
            setProfile(data.getProfile)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProfile({
                variables: {
                    account_id: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (profile !== null) {
            setImage(profile.main_photo === '' ? ProfilePhoto : profile.main_photo)
            setView({...view, latitude: profile.cords.lat, longitude: profile.cords.long, zoom: 16})
        }
    }, [profile])

    const onTelegram = () => {
        centum.go('telegram', profile.telegram)
    }

    const onCopy = () => {
        window.navigator.clipboard.writeText(`${context.username} приглашает вас на променаж ${date}. Текст: ${msg}`)
    }

    const onLikeBicycle = () => {
        manageProfileBicycle({
            variables: {
                account_id: params.id, option: 'like', title: '', category: '', status: '', mileage: 0, image: '', coll_id: bicycle.shortid
            }
        })
    }

    return (
        <>          
            {profile !== null && profile.account_id !== context.account_id &&
                <>
                    <ImageLook src={image} className='photo_item' alt='account photo' />
                    <h1>{profile.username}</h1>
                    <button onClick={onTelegram} className='light-btn'>Telegram</button>
                    <h3 className='pale'>Текст для приглашения</h3>
                    <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder='Ваш текст...' />
                    <h3 className='pale'>Дни для променажа</h3>
                    <div className='items small'>
                        {dates.map(el => <div onClick={() => setDate(el)} className={date === el ? 'item label active' : 'item label'}>{el}</div>)}
                    </div>
                    <button onClick={onCopy}>Скопировать</button>
                    <ReactMapGL {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                        <Marker latitude={profile.cords.lat} longitude={profile.cords.long}>
                            <MapPicker type='picker' />
                        </Marker>
                    </ReactMapGL>  

                    <DataPagination initialItems={profile.bicycles} setItems={setBicycles} label='Гараж:' />
                    <div className='items half'>
                        {bicycles.map(el => 
                            <div onClick={() => setBicycle(el)} className='item panel'>
                                {el.title}
                                <div className='items small'>
                                    <h5 className='pale'>Пробег: <b>{el.mileage}</b> км</h5>
                                    <h5 className='pale'>{el.status}</h5>
                                </div>
                            </div>    
                        )}
                    </div>

                    {bicycle !== null &&
                        <>
                            <CloseIt onClick={() => setBicycle(null)} />
                            {bicycle.image !== '' && <ImageLook src={bicycle.image} className='photo_item' alt='bicycle photo' />}
                            <h2>{bicycle.title}</h2>

                            <div className='items small'>
                                <h4 className='pale'>Тип: {bicycle.category}</h4>
                                <h4 className='pale'><b>{bicycle.likes}</b> лайков</h4>
                            </div>

                            <LikeButton onClick={onLikeBicycle} />
                        </>
                    }
                </>
            }  
        
            {profile === null && <Loading />} 
        </>
    )
}

export default Profile