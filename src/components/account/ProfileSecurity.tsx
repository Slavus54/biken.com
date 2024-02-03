import {useState, useMemo} from 'react';
import {useMutation, gql} from '@apollo/react-hooks'
import {CODE_ATTEMPTS} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {AccountPageComponentProps} from '../../types/types'

const ProfileSecurity = ({profile, context}: AccountPageComponentProps) => {
    const [flag, setFlag] = useState(false)
    const [attempts, setAttempts] = useState<number>(CODE_ATTEMPTS)
    const [percent, setPercent] = useState<number>(50)
    const [state, setState] = useState({
        security_code: ''
    })

    const centum = new Centum()

    const {security_code} = state

    const updateProfileSecurityCodeM = gql`
        mutation updateProfileSecurityCode($account_id: String!, $security_code: String!) {
            updateProfileSecurityCode(account_id: $account_id, security_code: $security_code)
        }
    `

    const [updateProfileSecurityCode] = useMutation(updateProfileSecurityCodeM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateProfileSecurityCode)
            window.location.reload()
        }
    })

    useMemo(() => {
        if (flag) {
            let num: number = 5
            let salt: string = centum.password(percent / num)
            let length: number = salt.length
            
            let name: string = profile.username.slice(length, length + num)

            setState({...state, security_code: name + salt})
        }
    }, [flag, percent])

    useMemo(() => {
        if (attempts === 0) {
            window.location.reload()
        } else {
            setState({...state, security_code: ''})
        }
    }, [attempts])

    const onUpdate = async () => {
        if (flag) {
            updateProfileSecurityCode({
                variables: {
                    account_id: context.account_id, security_code
                }
            })
        } else if (profile.security_code === security_code) {
            setFlag(true)
        } else {
            setAttempts(attempts > 0 ? attempts - 1 : 0)
        }
    }
    
    return (
        <>
            <h2>Безопасность</h2>

            <input value={security_code} onChange={e => setState({...state, security_code: e.target.value})} placeholder='Код безопасности' type='text' />
            {flag ? 
                    <>
                        <h4>Уровень безопасности: {percent}%</h4>
                        <input value={percent} onChange={e => setPercent(parseInt(e.target.value))} type='range' step={1} />
                    </>
                :
                    <h4 className='pale'>У вас осталось {attempts} попыток ввести код</h4>                                   
            }
        
            <button onClick={onUpdate}>{flag ? 'Обновить' : 'Подтвердить'}</button>
        </> 
    )
}

export default ProfileSecurity