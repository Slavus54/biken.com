import {useState} from 'react';
import {useMutation, gql} from '@apollo/react-hooks';
import ProfilePhoto from '../../assets/profile_photo.jpg'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import {AccountPageComponentProps} from '../../types/types'

const PersonalProfileInfo = ({profile, context}: AccountPageComponentProps) => {
    const [image, setImage] = useState(profile.main_photo === '' ? ProfilePhoto : profile.main_photo)

    const updateProfilePersonalInfoM = gql`
        mutation updateProfilePersonalInfo($account_id: String!, $main_photo: String!) {
            updateProfilePersonalInfo(account_id: $account_id, main_photo: $main_photo) 
        }
    `

    const [updateProfilePersonalInfo] = useMutation(updateProfilePersonalInfoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateProfilePersonalInfo)
            window.location.reload()
        }
    })

    const onUpdate = () => {
        updateProfilePersonalInfo({
            variables: {
                account_id: context.account_id, main_photo: image
            }
        })
    }
 
    return (
        <>
            <h2>Профиль</h2>
            <ImageLook src={image} className='photo_item' alt='account photo' />
            <h4 className='pale'>{profile.username}</h4>
            <ImageLoader setImage={setImage} />
 
            <button onClick={onUpdate}>Обновить</button>
        </> 
    )
}

export default PersonalProfileInfo