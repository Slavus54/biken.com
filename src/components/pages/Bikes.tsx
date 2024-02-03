import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {BICYCLE_TYPES, COUNTRIES, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import MapPicker from '../UI&UX/MapPicker'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'
import {TownType, Cords} from '../../types/types'

const Bikes: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>(BICYCLE_TYPES[0])
    const [country, setCountry] = useState<string>(COUNTRIES[0])
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<Cords>(towns[0].cords)
    const [bikes, setBikes] = useState(null)
    const [filtered, setFiltered] = useState([])

    const centum = new Centum()

    const getBikesM = gql`
        mutation getBikes($username: String!) {
            getBikes(username: $username) {
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

    const [getBikes] = useMutation(getBikesM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getBikes)
            setBikes(data.getBikes)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getBikes({
                variables: {
                    username: context.username
                }
            })
        }
    }, [context.account_id])

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

    useMemo(() => {
        if (bikes !== null) {
            let result = bikes.filter(el => el.region === region)

            if (title !== '') {
                result = result.filter(el => centum.search(el.title, title, SEARCH_PERCENT))
            }

            result = result.filter(el => el.category === category && el.country === country)

            setFiltered(result)
        }
    }, [bikes, title, category, country, region])

    return (
        <>          
            <h1>Велосипеды на аукционе</h1>
            
            <div className='items small'>
                <div className='item'>
                    <h4 className='pale'>Название</h4>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Наименование велосипеда' type='text' />
                </div>
                <div className='item'>
                    <h4 className='pale'>Где находится?</h4>
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Ближайший город' type='text' />
                </div>
            </div>
            
            <h4 className='pale'>Тип и производитель</h4>
            
            <div className='items small'>
                {BICYCLE_TYPES.map(el => <div onClick={() => setCategory(el)} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
            </div>
        
            <select value={country} onChange={e => setCountry(e.target.value)}>
                {COUNTRIES.map(el => <option value={el}>{el}</option>)}
            </select>    

            <DataPagination initialItems={filtered} setItems={setFiltered} label='Карта аукционов:' />

            {bikes !== null &&
                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token}>
                    <Marker latitude={cords.lat} longitude={cords.long}>
                        <MapPicker type='picker' />
                    </Marker>
                    
                    {filtered.map(el =>
                        <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                            <NavigatorWrapper id='' isRedirect={false} url={`/bike/${el.shortid}`}>
                                {centum.shorter(el.title)}
                            </NavigatorWrapper>
                        </Marker>
                    )}
                </ReactMapGL>  
            }  
        
            {bikes === null && <Loading />} 
        </>
    )
}

export default Bikes