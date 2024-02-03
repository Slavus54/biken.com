import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {DETAIL_TYPES, RATE_LIMIT} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import DataPagination from '../UI&UX/DataPagination'
import CloseIt from '../UI&UX/CloseIt'
import LikeButton from '../UI&UX/LikeButton'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType} from '../../types/types'

const Bike: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [feedback, setFeedback] = useState<string>('')
    const [image, setImage] = useState<string>('')
    const [isCanRate, setIsCanRate] = useState<boolean>(false)
    const [details, setDetails] = useState<any[]>([])
    const [rates, setRates] = useState<any[]>([])
    const [detail, setDetail] = useState<any | null>(null)
    const [rate, setRate] = useState<any | null>(null)
    const [bike, setBike] = useState<any | null>(null)
    const [state, setState] = useState({
        msg: '',
        cost: 0,
        text: '',
        category: '',
        explanation: ''
    })

    const centum = new Centum()

    const {msg, cost, text, category, explanation} = state

    const getBikeM = gql`
        mutation getBike($username: String!, $shortid: String!) {
            getBike(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                title
                category
                speeds
                wheel_size
                country
                phone
                cost
                image
                region
                cords {
                    lat
                    long
                }
                isOpen
                rates {
                    shortid
                    name
                    msg
                    cost
                }
                details {
                    shortid
                    name
                    text
                    category
                    explanation
                    likes
                }
            }
        }
    `

    const makeBikeRateM = gql`
        mutation makeBikeRate($username: String!, $id: String!, $msg: String!, $cost: Float!) {
            makeBikeRate(username: $username, id: $id, msg: $msg, cost: $cost)
        }
    `

    const manageBikeDetailM = gql`
        mutation manageBikeDetail($username: String!, $id: String!, $option: String!, $text: String!, $category: String!, $coll_id: String!, $explanation: String!) {
            manageBikeDetail(username: $username, id: $id, option: $option, text: $text, category: $category, coll_id: $coll_id, explanation: $explanation)
        }
    `

    const updateBikeImageM = gql`
        mutation updateBikeImage($username: String!, $id: String!, $image: String!) {
            updateBikeImage(username: $username, id: $id, image: $image)
        }
    `

    const [updateBikeImage] = useMutation(updateBikeImageM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateBikeImage)
            window.location.reload()
        }
    })

    const [manageBikeDetail] = useMutation(manageBikeDetailM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageBikeDetail)
            window.location.reload()
        }
    })

    const [makeBikeRate] = useMutation(makeBikeRateM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.makeBikeRate)
            window.location.reload()
        }
    })

    const [getBike] = useMutation(getBikeM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getBike)
            setBike(data.getBike)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getBike({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])
    
    useMemo(() => {
        if (bike !== null) {
            let rate = bike.rates.find(el => centum.search(el.shortid, context.account_id))
            let flag: boolean = true
            let info: string = ''

            if (context.account_id === bike.account_id) {
                flag = false
            } else if (bike.isOpen === false) {
                flag = false
                info = 'Аукцион закончился'
            } else if (rate !== undefined) {
                flag = false
                info = 'Вы уже сделали ставку'
            } else if (bike.rates.length >= RATE_LIMIT) {
                flag = false
                info = `Все ${RATE_LIMIT} ставок сделаны`
            }

            setIsCanRate(flag)
            setFeedback(info)
            setImage(bike.image)
            setState({...state, cost: bike.cost})
        }
    }, [bike])

    useMemo(() => {
        if (detail !== null) {
            setState({...state, explanation: detail.explanation})
        }
    }, [detail])

    const onMakeRate = () => {
        makeBikeRate({
            variables: {
                username: context.username, id: params.id, msg, cost
            }
        })
    }

    const onUpdateImage = () => {
        updateBikeImage({
            variables: {
                username: context.username, id: params.id, image
            }
        })
    }

    const onCloseAuction = () => {

    }

    const onManageDetail = (option: string) => {
        manageBikeDetail({
            variables: {
                username: context.username, id: params.id, option, text, category, coll_id: detail === null ? '' : detail.shortid, explanation 
            }
        })
    }

    return (
        <>          
            {bike !== null &&
                <>
                    <ImageLook src={image} className='photo_item' alt='bike photo' />
                    <h1>{bike.title}</h1>

                    <div className='items small'>
                        <h4 className='pale'>Тип: {bike.category}</h4>
                        <h4 className='pale'>{bike.speeds} скоростей</h4>
                    </div>

                    <h4 className='pale'><b>{bike.phone}</b></h4>

                    <NavigatorWrapper id={bike.account_id} isRedirect={true}>
                        <button className='light-btn'>Автор</button>
                    </NavigatorWrapper>
                
                    <h2>Текущая цена: {bike.cost}₽</h2>

                    {detail === null ? 
                            <>
                                <DataPagination initialItems={bike.details} setItems={setDetails} label='Вопросы о велосипеде:' />
                                <div className='items half'>
                                    {details.map(el => 
                                        <div onClick={() => setDetail(el)} className='item panel'>
                                            {centum.shorter(el.text)}
                                            <h5 className='pale'>{el.category}</h5>
                                        </div>    
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setDetail(null)} />

                                <h2>{detail.text}</h2>

                                {detail.name !== context.username && <LikeButton onClick={() => onManageDetail('like')} />}

                                <div className='items small'>
                                    <h4 className='pale'>Тема: {detail.category}</h4>
                                    <h4 className='pale'><b>{detail.likes}</b> лайков</h4>
                                </div>

                                {detail.name === context.username && <button onClick={() => onManageDetail('delete')}>Удалить</button>}
                               
                                {context.account_id === bike.account_id &&
                                    <>
                                        <h2>Ответьте на вопрос</h2>
                                        <textarea value={explanation} onChange={e => setState({...state, explanation: e.target.value})} placeholder='Ваш текст...' />
                                    
                                        <button onClick={() => onManageDetail('explain')}>Отправить</button>
                                    </>
                                }
                            </>
                    }                    
                </>
            }  

            {bike !== null && context.account_id === bike.account_id &&
                <>
                    <h2>Фотография велосипеда</h2>
                    <ImageLoader setImage={setImage} />
                    <button onClick={onUpdateImage}>Обновить</button>

                    <DataPagination initialItems={bike.rates} setItems={setRates} label='Список ставок:' />
                    <div className='items half'>
                        {rates.map(el => 
                            <div onClick={() => setRate(el)} className='item card'>
                                {el.cost}₽ от {el.name}
                            </div>    
                        )}
                    </div>

                    {rate !== null &&
                        <>
                            <CloseIt onClick={() => setRate(null)} />

                            <h2>Сообщение: {rate.msg}</h2>

                            <h4 className='pale'>Цена: {rate.cost}₽</h4>
                        </>
                    }

                    {bike.isOpen && 
                        <>
                            <h2>Хотите завершить аукцион?</h2>
                            <h4 className='pale'>Сделано {bike.rates.length}/{RATE_LIMIT} ставок</h4>
                            <button onClick={onCloseAuction} className='light-btn'>Завершить</button>
                        </>
                    }
                </>
            }  

            {bike !== null && context.account_id !== bike.account_id &&
                <>
                    <h2>Возникли вопросы?</h2>
                    <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Ваш текст...' />

                    <h4 className='pale'>Тема</h4>
                    <div className='items small'>
                        {DETAIL_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                    </div>

                    <button onClick={() => onManageDetail('create')}>Опубликовать</button>
                </>
            }

            {bike !== null && context.account_id !== bike.account_id && isCanRate &&
                <>
                    <h2>Ваша ставка</h2>
                    <textarea value={msg} onChange={e => setState({...state, msg: e.target.value})} placeholder='Ваше сообщение...' />
                    <input value={cost} onChange={e => setState({...state, cost: parseInt(e.target.value)})} placeholder='Цена велосипеда' type='text' />

                    {cost >= bike.cost ? <button onClick={onMakeRate}>Предложить</button> : <button onClick={() => setState({...state, cost: bike.cost})}>Сбросить</button>}
                </>
            }  

            {bike !== null && context.account_id !== bike.account_id && !isCanRate && <h2>{feedback}</h2> }   
        
            {bike === null && <Loading />} 
        </>
    )
}

export default Bike