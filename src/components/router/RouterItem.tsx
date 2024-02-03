import React from 'react'
import {Link} from 'wouter'

export type RouteType = {
    title: string,
    access_value?: number,
    url: string
}

const RouterItem: React.FC<RouteType> = ({url, title}) => {
    return <Link href={url} className='nav_item'>{title}</Link>
}

export default RouterItem