import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {CRITERIONS, PRODUCT_STATUSES, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
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

const Product: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<Cords>(towns[0].cords)
    const [image, setImage] = useState<string>('')
    const [offers, setOffers] = useState<any[]>([])
    const [reviews, setReviews] = useState<any[]>([])
    const [offer, setOffer] = useState<any | null>(null)
    const [review, setReview] = useState<any | null>(null)
    const [product, setProduct] = useState(null)
    const [state, setState] = useState({
        text: '',
        criterion: CRITERIONS[0],
        rating: 50,
        marketplace: '',
        cost: 1000,
        url: '',
        status: PRODUCT_STATUSES[0]
    })

    const centum = new Centum()

    const {text, criterion, rating, marketplace, cost, url, status} = state

    const getProductM = gql`
        mutation getProduct($username: String!, $shortid: String!) {
            getProduct(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                title
                category
                format
                country
                url
                status
                reviews {
                    shortid
                    name
                    text
                    criterion
                    rating
                    image
                }
                offers {
                    shortid
                    name
                    marketplace
                    cost
                    cords {
                        lat
                        long
                    }
                    likes
                }
            }
        }
    `

    const updateProductInfoM = gql`
        mutation updateProductInfo($username: String!, $id: String!, $url: String!, $status: String!) {
            updateProductInfo(username: $username, id: $id, url: $url, status: $status) 
        }
    `

    const makeProductReviewM = gql`
        mutation makeProductReview($username: String!, $id: String!, $text: String!, $criterion: String!, $rating: Float!, $image: String!) {
            makeProductReview(username: $username, id: $id, text: $text, criterion: $criterion, rating: $rating, image: $image) 
        }
    `

    const manageProductOfferM = gql`
        mutation manageProductOffer($username: String!, $id: String!, $option: String!, $marketplace: String!, $cost: Float!, $cords: ICord!, $coll_id: String!) {
            manageProductOffer(username: $username, id: $id, option: $option, marketplace: $marketplace, cost: $cost, cords: $cords, coll_id: $coll_id) 
        }
    `

    const [manageProductOffer] = useMutation(manageProductOfferM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageProductOffer)
            window.location.reload()
        }
    })

    const [makeProductReview] = useMutation(makeProductReviewM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.makeProductReview)
            window.location.reload()
        }
    })

    const [updateProductInfo] = useMutation(updateProductInfoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateProductInfo)
            window.location.reload()
        }
    })

    const [getProduct] = useMutation(getProductM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProduct)
            setProduct(data.getProduct)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProduct({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (product !== null) {
            setState({...state, url: product.url, status: product.status})
        }
    }, [product])

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

    const onManageOffer = (option: string) => {
        manageProductOffer({
            variables: {
                username: context.username, id: params.id, option, marketplace, cost, cords, coll_id: offer === null ? '' : offer.shortid
            }
        })
    }

    const onMakeReview = () => {
        makeProductReview({
            variables: {
                username: context.username, id: params.id, text, criterion, rating, image 
            }
        })
    }
    
    const onUpdateInfo = () => {
        updateProductInfo({
            variables: {
                username: context.username, id: params.id, url, status
            }
        })
    }

    return (
        <>          
            {product !== null &&
                <>
                    <h1>{product.title}</h1>

                    <div className='items small'>
                        <h4 className='pale'>Тип: {product.category}</h4>
                        <h4 className='pale'>Производитель: {product.country}</h4>
                    </div>

                    <h2>Уже приобрели?</h2>
                    <h4 className='pale'>Расскажите подробнее о товаре</h4>
                    <input value={url} onChange={e => setState({...state, url: e.target.value})} placeholder='URL' type='text' />
                    <select value={status} onChange={e => setState({...state, status: e.target.value})}>
                        {PRODUCT_STATUSES.map(el => <option value={el}>{el}</option>)}
                    </select>  

                    <button onClick={onUpdateInfo} className='light-btn'>Отправить</button>

                    {offer === null ? 
                            <>
                                <h2>Новое предложение</h2>
                                
                                <div className='items small'>
                                    <input value={marketplace} onChange={e => setState({...state, marketplace: e.target.value})} placeholder='Название магазина' type='text' />
                                    <input value={cost} onChange={e => setState({...state, cost: parseInt(e.target.value)})} placeholder='Цена товара' type='text' />
                                </div>
                                

                                <h4 className='pale'>Где находится?</h4>
                                <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Ближайший город' type='text' />

                                {isNaN(cost) ? <button onClick={() => setState({...state, cost: 1000})}>Сбросить</button> : <button onClick={() => onManageOffer('create')}>Добавить</button>}
                                <DataPagination initialItems={product.offers} setItems={setOffers} label='Карта предложений:' />
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setOffer(null)} />

                                <h2>{offer.marketplace}</h2>

                                <div className='items small'>
                                    <h4 className='pale'>Цена: {offer.cost}₽</h4>
                                    <h4 className='pale'><b>{offer.likes}</b> лайков</h4>
                                </div>

                                {offer.name === context.username ? 
                                        <button onClick={() => onManageOffer('delete')}>Удалить</button>
                                    :
                                        <LikeButton onClick={() => onManageOffer('like')} />
                                }
                            </>
                    }

                    <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                        <Marker latitude={cords.lat} longitude={cords.long}>
                            <MapPicker type='picker' />
                        </Marker>
                        
                        {offers.map(el =>
                            <Marker onClick={() => setOffer(el)} latitude={el.cords.lat} longitude={el.cords.long}>
                                {centum.shorter(el.marketplace)}
                            </Marker>
                        )}
                    </ReactMapGL>  

                    {review === null ?
                            <>
                                <h2>Оставьте отзыв</h2>

                                <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Ваш текст...' />

                                <h4 className='pale'>Критерий</h4>
                                <div className='items small'>
                                    {CRITERIONS.map(el => <div onClick={() => setState({...state, criterion: el})} className={el === criterion ? 'item label active' : 'item label'}>{el}</div>)}
                                </div> 

                                <h4 className='pale'>Рейтинг: <b>{rating}%</b></h4>
                                <input value={rating} onChange={e => setState({...state, rating: parseInt(e.target.value)})} type='range' step={1} />

                                <ImageLoader setImage={setImage} />

                                <button onClick={onMakeReview}>Опубликовать</button>

                                <DataPagination initialItems={product.reviews} setItems={setReviews} label='Отзывы:' />
                                <div className='items half'>
                                    {reviews.map(el => 
                                        <div onClick={() => setReview(el)} className='item panel'>
                                            {centum.shorter(el.text)}

                                            <h5 className='pale'>{el.criterion}</h5>
                                        </div>     
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setReview(null)} />
                                {review.image !== '' && <ImageLook src={review.image} className='photo_item' alt='review photo' />}
                               
                                <h2>{review.text}</h2>

                                <div className='items small'>
                                    <h4 className='pale'>Автор: {review.name}</h4>
                                    <h4 className='pale'>Рейтинг: <b>{review.rating}%</b></h4>
                                </div>
                            </>
                    }
                </>
            }  
        
            {product === null && <Loading />} 
        </>
    )
}

export default Product