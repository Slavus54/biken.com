import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {CYCLIST_TYPES, GENDERS, COUNTRIES} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType} from '../../types/types'

const CreateCyclist: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [idx, setIdx] = useState<number>(0)
    const [percent, setPercent] = useState<number>(50)
    const [state, setState] = useState({
        fullname: '', 
        category: CYCLIST_TYPES[0], 
        sex: GENDERS[0],
        country: COUNTRIES[0]
    })

    const centum = new Centum()

    const {fullname, category, sex, country} = state

    const createCyclistM = gql`
        mutation createCyclist($username: String!, $id: String!, $fullname: String!, $category: String!, $sex: String!, $country: String!) {
            createCyclist(username: $username, id: $id, fullname: $fullname, category: $category, sex: $sex, country: $country)
        }
    `

    const [createCyclist] = useMutation(createCyclistM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createCyclist)
            window.location.reload()
        }
    })

    const onCreate = () => {
        createCyclist({
            variables: {
                username: context.username, id: params.id, fullname, category, sex, country
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Новый Велогонщик' num={idx} setNum={setIdx} items={[
                    <>
                        <h3 className='pale'>Полное имя</h3>
                        <input value={fullname} onChange={e => setState({...state, fullname: e.target.value})} placeholder='Имя спортсмена' type='text' />
                    
                        <h3 className='pale'>Сфера</h3>
                        <div className='items small'>
                            {CYCLIST_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>                         
                    </>,
                    <>
                        <h3 className='pale'>Пол и страна</h3>
                        
                        <select value={sex} onChange={e => setState({...state, sex: e.target.value})}>
                            {GENDERS.map(el => <option value={el}>{el}</option>)}
                        </select>
                        <div className='items small'>
                            {COUNTRIES.map(el => <div onClick={() => setState({...state, country: el})} className={el === country ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>   
                    </>
                ]} 
            />

           <button onClick={onCreate}>Создать</button>
        </div>
    )
}

export default CreateCyclist