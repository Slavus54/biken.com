import React from 'react'
import NavigatorWrapper from '../router/NavigatorWrapper'
import PlatformFeatures from '../pieces/PlatformFeatures'
import AdvantagesCalculator from '../pieces/AdvantagesCalculator'

const Welcome: React.FC = () => {
    
    return (
        <>          
            <h1>Biken.com</h1>
            <h3 className='pale text'>Платформа для любителей велосипедов и активного образа жизни</h3>
            
            <h2>Создайте аккаунт</h2>
            <NavigatorWrapper isRedirect={false} url='/register'>
                <button className='light-btn'>Начать</button>
            </NavigatorWrapper>

            <h2>Возможности платформы</h2>
            <PlatformFeatures />

            <h2>Преимущества велосипеда</h2>
            <AdvantagesCalculator />
        </>
    )
}

export default Welcome