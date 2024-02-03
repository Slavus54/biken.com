import {ImageLookProps} from '../../types/types'

const ImageLook: React.FC<ImageLookProps> = ({src, min = 16, max = 18, speed = 0.1, className = 'photo_item', onClick = () => {}, alt = 'фото'}) => {

    const onLookImage = (target: any, isZoom: boolean) => {
        target.style.transition = `${speed}s`
        target.style.width = (isZoom ? max : min) + 'rem'
    }

    return (
        <img src={src} onClick={onClick} onMouseEnter={e => onLookImage(e.target, true)} onMouseLeave={e => onLookImage(e.target, false)} className={className} alt={alt} loading='lazy' />
    )
}

export default ImageLook