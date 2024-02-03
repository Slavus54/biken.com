const MapPicker = ({type = 'home'}) => {
    return type === 'home' ?  
        <img src="https://img.icons8.com/ios/50/address--v1.png" alt="visit--v1" className='map_picker' /> 
    :  
        <img src="https://img.icons8.com/ios/50/visit--v1.png" alt="visit--v1" className='map_picker' />
}

export default MapPicker