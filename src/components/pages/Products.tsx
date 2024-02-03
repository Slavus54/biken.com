import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {PRODUCT_TYPES, BIKE_FORMATS, SEARCH_PERCENT} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'

const Products: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>(PRODUCT_TYPES[0])
    const [format, setFormat] = useState<string>(BIKE_FORMATS[0])
    const [products, setProducts] = useState(null)
    const [filtered, setFiltered] = useState([])

    const centum = new Centum()

    const getProductsM = gql`
        mutation getProducts($username: String!) {
            getProducts(username: $username) {
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

    const [getProducts] = useMutation(getProductsM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProducts)
            setProducts(data.getProducts)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProducts({
                variables: {
                    username: context.username
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (products !== null) {
            let result = products.filter(el => el.category === category && el.format === format)

            if (title !== '') {
                result = result.filter(el => centum.search(el.title, title, SEARCH_PERCENT))
            }

            setFiltered(result)
        }
    }, [products, title, category, format])

    return (
        <>          
            <h1>Что могу приобрести?</h1>
      
            <h4 className='pale'>Наименование товара</h4>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Введите название' type='text' />
              
            
            <h4 className='pale'>Тип</h4>
            <div className='items small'>
                {PRODUCT_TYPES.map(el => <div onClick={() => setCategory(el)} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
            </div>      

            <select value={format} onChange={e => setFormat(e.target.value)}>
                {BIKE_FORMATS.map(el => <option value={el}>{el}</option>)}
            </select> 

            <DataPagination initialItems={filtered} setItems={setFiltered} label='Список товаров:' />

            {products !== null &&
                <div className='items half'>
                    {filtered.map(el => 
                        <div className='item card'>
                            <NavigatorWrapper isRedirect={false} url={`/product/${el.shortid}`}>
                                {centum.shorter(el.title)}
                            </NavigatorWrapper>
                        </div>    
                    )}
                </div> 
            }  
        
            {products === null && <Loading />} 
        </>
    )
}

export default Products