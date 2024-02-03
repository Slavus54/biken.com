import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {CYCLIST_TYPES, SEARCH_PERCENT} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'

const Cyclists: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>(CYCLIST_TYPES[0])
    const [cyclists, setCyclists] = useState(null)
    const [filtered, setFiltered] = useState([])

    const centum = new Centum()

    const getCyclistsM = gql`
        mutation getCyclists($username: String!) {
            getCyclists(username: $username) {
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

    const [getCyclists] = useMutation(getCyclistsM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getCyclists)
            setCyclists(data.getCyclists)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getCyclists({
                variables: {
                    username: context.username
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (cyclists !== null) {
            let result = cyclists.filter(el => el.category === category)

            if (title !== '') {
                result = result.filter(el => centum.search(el.title, title, SEARCH_PERCENT))
            }

            setFiltered(result)
        }
    }, [cyclists, title, category])

    return (
        <>          
            <h1>Легенды велоспорта</h1>
      
            <h4 className='pale'>Полное имя</h4>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Имя спортсмена' type='text' />
              
            
            <h4 className='pale'>Сфера</h4>
            <div className='items small'>
                {CYCLIST_TYPES.map(el => <div onClick={() => setCategory(el)} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
            </div>      

            <DataPagination initialItems={filtered} setItems={setFiltered} label='Список велогонщиков:' />

            {cyclists !== null &&
                <div className='items half'>
                    {filtered.map(el => 
                        <div className='item card'>
                            <NavigatorWrapper isRedirect={false} url={`/cyclist/${el.shortid}`}>
                                {centum.shorter(el.fullname)}
                            </NavigatorWrapper>
                        </div>    
                    )}
                </div> 
            }  
        
            {cyclists === null && <Loading />} 
        </>
    )
}

export default Cyclists