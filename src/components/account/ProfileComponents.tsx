import {useState} from 'react'
//@ts-ignore
import Centum from 'centum.js'
import components from '../../env/components.json'
import NavigatorWrapper from '../router/NavigatorWrapper'
import DataPagination from '../UI&UX/DataPagination'
import Exit from '../UI&UX/Exit'
import {AccountPageComponentProps} from '../../types/types'

const ProfileComponents = ({profile, context}: AccountPageComponentProps) => {
    const [items, setItems] = useState<any[]>([])

    const centum = new Centum()

    return (
        <>
            <h2>Что я могу?</h2>   

            <h4 className='pale tag'>создавать компоненты</h4>
            <div className='items small'>
                {components.map(el => 
                    <div className='item'>
                        <NavigatorWrapper id='' isRedirect={false} url={`/create-${el.path}/${context.account_id}`}>
                            <h4>{el.title}</h4>
                        </NavigatorWrapper>   
                    </div>     
                )}
            </div>

            <DataPagination initialItems={profile.account_components} setItems={setItems} label='Мои компоненты:' />
            <div className='items half'>
                {items.map(el =>
                    <div className='item panel'>
                        <NavigatorWrapper id='' isRedirect={false} url={`/${el.path}/${el.shortid}`}>
                            {centum.shorter(el.title, 2)}
                            <h5 className='pale'>{el.path}</h5>
                        </NavigatorWrapper>    
                    </div>
                )}
            </div>

            <Exit /> 
        </> 
    )
}

export default ProfileComponents