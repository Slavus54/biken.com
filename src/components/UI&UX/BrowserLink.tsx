import React from 'react'
import ImageLook from './ImageLook'
import {BrowserImageProps} from '../../types/types'

const GOOGLE_IMAGE: string = 'https://img.icons8.com/color/48/google-logo.png'

const BrowserLink: React.FC<BrowserImageProps> = ({url, alt = 'link'}) => 

<ImageLook 
    onClick={() => window.open(url)} 
    src={GOOGLE_IMAGE} 
    min={3} max={3}
    className='icon' 
    alt={alt} 
/>

export default BrowserLink