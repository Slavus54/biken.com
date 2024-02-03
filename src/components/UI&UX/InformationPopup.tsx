import React, {useState, useEffect} from 'react'
import ImageLook from '../UI&UX/ImageLook'
import {InformationPopupProps} from '../../types/types'

const InformationImage: string = 'https://img.icons8.com/ios/50/information--v1.png'

const InformationPopup: React.FC<InformationPopupProps> = ({text}) => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        let body: any = document.body

        body.style.opacity = isOpen ? .5 : 1
    }, [isOpen])

    return (
        <div className='main'>
            <ImageLook onClick={() => setIsOpen(!isOpen)} src={InformationImage} min={3} max={3} className='icon' alt='popup icon' />
            {isOpen && <div onClick={() => setIsOpen(false)} id='modal'><h4>{text}</h4></div>}
        </div>
    )
}

export default InformationPopup