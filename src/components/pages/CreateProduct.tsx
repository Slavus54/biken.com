import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {PRODUCT_TYPES, PRODUCT_STATUSES, BIKE_FORMATS, COUNTRIES} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType} from '../../types/types'

const CreateProduct: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [idx, setIdx] = useState<number>(0)
    const [percent, setPercent] = useState<number>(50)
    const [state, setState] = useState({
        title: '', 
        category: PRODUCT_TYPES[0], 
        format: BIKE_FORMATS[0], 
        country: COUNTRIES[0], 
        url: '', 
        status: PRODUCT_STATUSES[0]
    })

    const centum = new Centum()

    const {title, category, format, country, url} = state

    const createProductM = gql`
        mutation createProduct($username: String!, $id: String!, $title: String!, $category: String!, $format: String!, $country: String!, $url: String!, $status: String!)  {
            createProduct(username: $username, id: $id, title: $title, category: $category, format: $format, country: $country, url: $url, status: $status) 
        }
    `

    const [createProduct] = useMutation(createProductM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createProduct)
            window.location.reload()
        }
    })

    const onCreate = () => {
        createProduct({
            variables: {
                username: context.username, id: params.id, title, category, format, country, url, status
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Новый Товар' num={idx} setNum={setIdx} items={[
                    <>
                        <h3 className='pale'>Полное наименование</h3>
                        <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Название товара' type='text' />
                    
                        <select value={format} onChange={e => setState({...state, format: e.target.value})}>
                            {BIKE_FORMATS.map(el => <option value={el}>{el}</option>)}
                        </select>      

                        <h3 className='pale'>Тип</h3>
                        <div className='items small'>
                            {PRODUCT_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>                                         
                    </>,
                    <>
                        <h3 className='pale'>Уже приобрели?</h3>
                        <input value={url} onChange={e => setState({...state, url: e.target.value})} placeholder='URL' type='text' />
                        <select value={status} onChange={e => setState({...state, status: e.target.value})}>
                            {PRODUCT_STATUSES.map(el => <option value={el}>{el}</option>)}
                        </select>  

                        <h3 className='pale'>Страна производства</h3> 
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

export default CreateProduct