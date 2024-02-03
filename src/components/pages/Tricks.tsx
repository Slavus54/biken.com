import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {TRICK_TYPES, LEVELS, SEARCH_PERCENT} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'

const Tricks: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>(TRICK_TYPES[0])
    const [level, setLevel] = useState<string>(LEVELS[0])
    const [tricks, setTricks] = useState(null)
    const [filtered, setFiltered] = useState([])

    const centum = new Centum()

    const getTricksM = gql`
        mutation getTricks($username: String!) {
            getTricks(username: $username) {
                shortid
                account_id
                username
                title
                category
                level
                bicycles
                max_speed
                steps {
                    id
                    content
                    dateUp
                }
                stars
                locations {
                    shortid
                    name
                    text
                    format
                    image
                    cords {
                        lat
                        long
                    }
                }
                videos {
                    shortid
                    name
                    title
                    category
                    url
                    likes
                }
            }
        }
    `

    const [getTricks] = useMutation(getTricksM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getTricks)
            setTricks(data.getTricks)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getTricks({
                variables: {
                    username: context.username
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (tricks !== null) {
            let result = tricks.filter(el => el.category === category)

            if (title !== '') {
                result = result.filter(el => centum.search(el.title, title, SEARCH_PERCENT))
            }

            result = result.filter(el => el.level === level)

            setFiltered(result)
        }
    }, [tricks, title, category, level])

    return (
        <>          
            <h1>Поиск трюков на любой вкус</h1>
      
            <h4 className='pale'>Название</h4>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Название трюка' type='text' />
              
            
            <h4 className='pale'>Тип и сложность</h4>
            
            <div className='items small'>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                    {TRICK_TYPES.map(el => <option value={el}>{el}</option>)}
                </select>
                <select value={level} onChange={e => setLevel(e.target.value)}>
                    {LEVELS.map(el => <option value={el}>{el}</option>)}
                </select>
            </div>   

            <DataPagination initialItems={filtered} setItems={setFiltered} label='Список трюков:' />

            {tricks !== null &&
                <div className='items half'>
                    {filtered.map(el => 
                        <div className='item card'>
                            <NavigatorWrapper isRedirect={false} url={`/trick/${el.shortid}`}>
                                {centum.shorter(el.title)}
                            </NavigatorWrapper>
                        </div>    
                    )}
                </div> 
            }  
        
            {tricks === null && <Loading />} 
        </>
    )
}

export default Tricks