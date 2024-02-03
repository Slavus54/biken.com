import React, {useState, useMemo} from 'react'
import Centum from 'centum.js'
import {ROLL_LEVELS, AUTO_BASE} from '../../env/env'

const AdvantagesCalculator: React.FC = () => {
    const [level, setLevel] = useState<string>(ROLL_LEVELS[0])
    const [weight, setWeight] = useState<number>(65)
    const [distance, setDistance] = useState<number>(10)
    const [calories, setCalories] = useState<number>(0)
    const [expense, setExpense] = useState<number>(0)
    
    const centum = new Centum()

    useMemo(() => {
        let idx: number = ROLL_LEVELS.indexOf(level) + 1

        idx /= 10

        idx++

        setCalories(centum.calories(weight, distance) * idx)

        setExpense(centum.round(distance * AUTO_BASE))
    }, [weight, distance, level])

    return (
        <>
            <div className='items half'>
                <h4 className='pale'>Потраченые калории - <b>{calories}</b> ккал</h4>
                <h4 className='pale'>Перемещение на авто за <b>{expense}</b> ₽</h4>
            </div>

            <select value={level} onChange={e => setLevel(e.target.value)}>
                {ROLL_LEVELS.map(el => <option value={el}>{el}</option>)}
            </select> 

            <p>Вес: {weight} кг</p>
            <input value={weight} onChange={e => setWeight(parseInt(e.target.value))} type='range' step={1} />

            <p>Дистанция: {distance} км</p>
            <input value={distance} onChange={e => setDistance(parseInt(e.target.value))} type='range' step={1} />

          
        </>
    )
}

export default AdvantagesCalculator