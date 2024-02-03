import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {BICYCLE_TYPES, COMPETITION_TYPES, LEVELS} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import DataPagination from '../UI&UX/DataPagination'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import CloseIt from '../UI&UX/CloseIt'
import LikeButton from '../UI&UX/LikeButton'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType} from '../../types/types'

const Cyclist: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [image, setImage] = useState<string>('')
    const [competitions, setCompetitions] = useState<any[]>([])
    const [competition, setCompetition] = useState<any | null>(null)
    const [fact, setFact] = useState<any | null>(null)
    const [cyclist, setCyclist] = useState(null)
    const [state, setState] = useState({
        text: '',
        category: BICYCLE_TYPES[0],
        format: COMPETITION_TYPES[0],
        content: '',
        level: LEVELS[0],
        isTrue: false,
        rating: 0
    })

    const centum = new Centum()

    const {text, category, format, content, level, isTrue, rating} = state

    const getCyclistM = gql`
        mutation getCyclist($username: String!, $shortid: String!) {
            getCyclist(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                fullname
                category
                sex
                country
                rating
                competitions {
                    shortid
                    name
                    text
                    category
                    format
                    image
                    likes 
                }
                facts {
                    shortid
                    name
                    content
                    level
                    isTrue
                }
            }
        }
    `

    const manageCyclistCompetitionM = gql`
        mutation manageCyclistCompetition($username: String!, $id: String!, $option: String!, $text: String!, $category: String!, $format: String!, $image: String!, $coll_id: String!) {
            manageCyclistCompetition(username: $username, id: $id, option: $option, text: $text, category: $category, format: $format, image: $image, coll_id: $coll_id) 
        }
    `

    const updateCyclistRatingM = gql`
        mutation updateCyclistRating($username: String!, $id: String!, $rating: Float!) {
            updateCyclistRating(username: $username, id: $id, rating: $rating)
        }
    `

    const makeCyclistFactM = gql`
        mutation makeCyclistFact($username: String!, $id: String!, $content: String!, $level: String!, $isTrue: Boolean!) {
            makeCyclistFact(username: $username, id: $id, content: $content, level: $level, isTrue: $isTrue)
        }
    `

    const [makeCyclistFact] = useMutation(makeCyclistFactM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.makeCyclistFact)
            window.location.reload()
        }
    })

    const [updateCyclistRating] = useMutation(updateCyclistRatingM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateCyclistRating)
            window.location.reload()
        }
    })

    const [manageCyclistCompetition] = useMutation(manageCyclistCompetitionM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageCyclistCompetition)
            window.location.reload()
        }
    })

    const [getCyclist] = useMutation(getCyclistM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getCyclist)
            setCyclist(data.getCyclist)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getCyclist({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (cyclist !== null) {
            setState({...state, rating: cyclist.rating})
        }
    }, [cyclist])

    useMemo(() => {
        setState({...state, isTrue: false})
    }, [fact])

    const onFact = () => {
        if (fact === null) {
            let result = centum.random(cyclist.facts)?.value

            if (result !== undefined) {
                setFact(result)
            }
        } else {
            let award = LEVELS.indexOf(fact.level) + 1

            if (isTrue === fact.isTrue) {
                setState({...state, rating: rating + award})
            }
        
            setFact(null)
        }
    }

    const onManageCompetition = (option: string) => {
        manageCyclistCompetition({
            variables: {
                username: context.username, id: params.id, option, text, category, format, image, coll_id: competition === null ? '' : competition.shortid 
            }
        })
    }

    const onMakeFact = () => {
        makeCyclistFact({
            variables: {
                username: context.username, id: params.id, content, level, isTrue
            }
        })
    }

    const onUpdateRating = () => {
        updateCyclistRating({
            variables: {
                username: context.username, id: params.id, rating
            }
        })
    }

    return (
        <>          
            {cyclist !== null &&
                <>
                    <h1>{cyclist.fullname}</h1>

                    <div className='items small'>
                        <h4 className='pale'>Сфера: {cyclist.category}</h4>
                        <h4 className='pale'>Страна: {cyclist.country}</h4>
                    </div>  

                    {competition === null ? 
                            <>
                                <h2>Новое соревнование</h2>

                                <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Название мероприятия...' />
                                
                                <h4 className='pale'>Велосипед</h4>
                                <div className='items small'>
                                    {BICYCLE_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                                </div>   

                                <select value={format} onChange={e => setState({...state, format: e.target.value})}>
                                    {COMPETITION_TYPES.map(el => <option value={el}>{el}</option>)}
                                </select>      

                                <ImageLoader setImage={setImage} />

                                <button onClick={() => onManageCompetition('create')}>Добавить</button>
                            
                                <DataPagination initialItems={cyclist.competitions} setItems={setCompetitions} label='Список соревнований:' />
                                <div className='items half'>
                                    {competitions.map(el => 
                                        <div onClick={() => setCompetition(el)} className='item panel'>
                                            {centum.shorter(el.text)}
                                            <h5 className='pale'>{el.format}</h5>
                                        </div>    
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setCompetition(null)} />
                                            
                                {competition.image !== '' && <ImageLook src={competition.image} className='photo_item' alt='competition photo' />}

                                <h2>{competition.text}</h2>

                                <div className='items small'>
                                    <h4 className='pale'>Велосипед: {competition.category}</h4>
                                    <h4 className='pale'><b>{competition.likes}</b> лайков</h4>
                                </div> 

                                {competition.name === context.username ? 
                                        <button onClick={() => onManageCompetition('delete')}>Удалить</button>
                                    :
                                        <LikeButton onClick={() => onManageCompetition('like')} />
                                }
                            </>
                    }

                    {fact === null ?
                            <>
                                <h2>Поведайте больше о {cyclist.fullname}</h2>

                                <h4 className='pale'>Рейтинг: {rating}</h4>
                                <button onClick={onUpdateRating} className='light-btn'>Обновить</button>

                                <textarea value={content} onChange={e => setState({...state, content: e.target.value})} placeholder='Текст факта...' />

                                <button onClick={() => setState({...state, isTrue: !isTrue})} className='light-btn pale'>Позиция: {isTrue ? 'Истина' : 'Ложь'}</button>

                                <select value={level} onChange={e => setState({...state, level: e.target.value})}>
                                    {LEVELS.map(el => <option value={el}>{el}</option>)}
                                </select>     

                                <div className='items small'>
                                    <button onClick={onFact}>Сгенерировать</button>
                                    <button onClick={onMakeFact}>Опубликовать</button>
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setFact(null)} />

                                <h2 className='text'>Факт: {fact.content}</h2>
                                <h4 className='pale'>Сложность: {fact.level}</h4>

                                <div className='items small'>
                                    <button onClick={() => setState({...state, isTrue: !isTrue})} className='light-btn pale'>Позиция: {isTrue ? 'Истина' : 'Ложь'}</button>
                                    <button onClick={onFact}>Проверить</button>
                                </div>
                            </>
                    }
                </>
            }  
        
            {cyclist === null && <Loading />} 
        </>
    )
}

export default Cyclist