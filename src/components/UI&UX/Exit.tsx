import {useContext} from 'react'
import {EXIT} from '../../env/env'
import ImageLook from '../UI&UX/ImageLook'
import {Context} from '../../context/WebProvider'

const Exit = () => {
    const {change_context} = useContext(Context)

    const onExit = () => {
        change_context('update', null, 1)
    }

    return <ImageLook onClick={onExit} src={EXIT} min={2} max={2.2} className='icon' alt='exit' />
}

export default Exit