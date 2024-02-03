import React, {useContext} from 'react'
import {useLocation} from 'wouter'
import {Context} from '../../context/WebProvider'
import {NavigatorWrapperPropsType} from '../../types/types'

const NavigatorWrapper: React.FC<NavigatorWrapperPropsType> = ({children, isRedirect = false, id = '', url = '/'}) => {
    const {context} = useContext(Context)
    const [loc, setLoc] = useLocation()

    const onRedirect = () => {
        if (context.account_id === id) {
            setLoc('/')
        } else {
            setLoc(`/profile/${id}`)
        }
    }

    return (
        <div onClick={() => isRedirect ? onRedirect() : setLoc(url)}>
           {children}
        </div>
    )
}

export default NavigatorWrapper