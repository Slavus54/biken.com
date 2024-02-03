import React from 'react'
import ImageLook from './ImageLook'
import {LIKE_ICON} from '../../env/env'
import {SimpleTriggerProps} from '../../types/types'

const LikeButton: React.FC<SimpleTriggerProps> = ({onClick}) => {
    return <ImageLook onClick={onClick} src={LIKE_ICON} min={2} max={2} className='icon' alt='like button' />
}

export default LikeButton