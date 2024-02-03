import {useMemo, useContext} from 'react'
import {Context} from '../../context/WebProvider'
import Router from '../router/Router'
import {init} from '../../store/ls'

const Layout = () => {
    const {change_context, context} = useContext(Context)

    useMemo(() => {
        change_context('create', null)
        init()
    }, [context])

    return (
        <div className='main'>
            <Router account_id={context.account_id} username={context.username} />
        </div>
    )
}

export default Layout