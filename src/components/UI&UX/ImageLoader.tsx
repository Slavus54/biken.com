import {ImageLoaderProps} from '../../types/types'

const ImageLoader: React.FC<ImageLoaderProps> = ({setImage, label = ''}) => {

    const onLoad = (e: any) => {
        let reader = new FileReader()

        reader.onload = (file: any) => {
            setImage(file.target.result)
        }

        reader.readAsDataURL(e.target.files[0])
    }

    return (
        <>
            <input onChange={e => onLoad(e)} type='file' accept='image/*' id='loader' required />
            <label htmlFor='loader'>{label}</label>
        </>
    )
}

export default ImageLoader