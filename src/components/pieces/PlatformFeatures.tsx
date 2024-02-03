import React from 'react'
import features from '../../env/features.json'

const PlatformFeatures: React.FC = () => {
    
    return (
        <div className='items half'>          
            {features.map(el => 
                <div className='item panel'>
                    <h3>{el}</h3>
                </div>
            )}
        </div>
    )
}

export default PlatformFeatures