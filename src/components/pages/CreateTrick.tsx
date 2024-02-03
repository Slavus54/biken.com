import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {TRICK_TYPES, LEVELS, BICYCLE_TYPES, COLLECTION_LIMIT} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import shortid from 'shortid'
//@ts-ignore
import {Datus} from 'datus.js'
import {Context} from '../../context/WebProvider'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType} from '../../types/types'

const CreateTrick: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [idx, setIdx] = useState<number>(0)
    const [percent, setPercent] = useState<number>(50)
    const datus = new Datus()
    const [step, setStep] = useState({
        id: shortid.generate().toString(),
        content: '',
        dateUp: datus.move()
    })
    const [state, setState] = useState({
        title: '', 
        category: TRICK_TYPES[0], 
        level: LEVELS[0],
        bicycles: [],
        max_speed: 0,
        steps: []
    })

    const centum = new Centum()

    const {title, category, level, bicycles, max_speed, steps} = state
    const {id, content, dateUp} = step

    const createTrickM = gql`
        mutation createTrick($username: String!, $id: String!, $title: String!, $category: String!, $level: String!, $bicycles: [String]!, $max_speed: Float!, $steps: [IStep]!) {
            createTrick(username: $username, id: $id, title: $title, category: $category, level: $level, bicycles: $bicycles, max_speed: $max_speed, steps: $steps)
        }
    `

    const [createTrick] = useMutation(createTrickM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createTrick)
            window.location.reload()
        }
    })

    useMemo(() => {
        setState({...state, max_speed: centum.part(percent, 32, 1)})
    }, [percent])

    const onManageBicycleTypes = bike => {
        let result = bicycles.find(el => centum.search(el, bike, 100)) 

        setState({...state, bicycles: result === undefined ? [...bicycles, bike] : bicycles.filter(el => el !== bike)})
    }

    const onStep = () => {
        if (steps.length < COLLECTION_LIMIT) {
            setState({...state, steps: [...steps, step]})
        }

        setStep({
            id: shortid.generate().toString(),
            content: '',
            dateUp: datus.move()
        })
    }

    const onCreate = () => {
        createTrick({
            variables: {
                username: context.username, id: params.id, title, category, level, bicycles, max_speed, steps
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Новый Трюк' num={idx} setNum={setIdx} items={[
                    <>
                        <h3 className='pale'>Название</h3>
                        <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Название трюка' type='text' />
                        
                        <h3 className='pale'>Характеристики</h3>
                        <div className='items small'>
                            <select value={category} onChange={e => setState({...state, category: e.target.value})}>
                                {TRICK_TYPES.map(el => <option value={el}>{el}</option>)}
                            </select>
                            <select value={level} onChange={e => setState({...state, level: e.target.value})}>
                                {LEVELS.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>     

                        <h3 className='pale'>Типы велосипедов</h3>
                       
                        <div className='items small'>
                            {BICYCLE_TYPES.map(el => <div onClick={() => onManageBicycleTypes(el)} className='item label'>{el}</div>)}
                        </div>                         
                    </>,
                    <>
                        <h3 className='pale'>Шаги выполнения ({steps.length}/{COLLECTION_LIMIT})</h3>
                        <textarea value={content} onChange={e => setStep({...step, content: e.target.value})} placeholder='Опишите это...' />
                        <button onClick={onStep} className='light-btn'>Добавить</button>
                        <h3 className='pale'>Скорость выполнения - <b>{max_speed}</b> км/ч</h3>
                        <input value={percent} onChange={e => setPercent(parseInt(e.target.value))} type='range' step={1} />
                    </>
                ]} 
            />

           <button onClick={onCreate}>Создать</button>
        </div>
    )
}

export default CreateTrick