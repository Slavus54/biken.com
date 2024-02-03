import {FormPaginationProps} from '../../types/types'

const FormPagination: React.FC<FormPaginationProps> = ({label = '', num, setNum, items = []}) => {
    return (
        <>
            <div className='items small'>
                <img onClick={() => num > 0 && setNum(num - 1)} src='https://img.icons8.com/ios/50/left--v1.png' className='icon' alt='prev' />
                <h1>{label}</h1>
                <img onClick={() => num < items.length - 1 && setNum(num + 1)} src='https://img.icons8.com/ios/50/right--v1.png' className='icon' alt='next' />
            </div>
            {items[num]}           
        </>
    )
}

export default FormPagination