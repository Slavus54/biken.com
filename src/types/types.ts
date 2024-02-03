export interface AccountPageComponentProps {
    profile: any,
    context: any
}

export type AccountPageComponentType = {
    title: string
    icon: string
    component: any
}

export type CollectionPropsType = {
    params: {
        id: string
    }
}

export type Cords = {
    lat: number
    long: number
}

export type TownType = {
    title: string
    cords: Cords
}

export type NavigatorWrapperPropsType = {
    children: any
    isRedirect: boolean
    id?: string
    url?: string
}

// UI&UX

export type ImageLookProps = {
    src: any
    className: string
    min?: number
    max?: number
    speed?: number
    onClick?: any
    alt?: string
}

export type BrowserImageProps = {
    url: string,
    alt?: string
}

export type SimpleTriggerProps = {
    onClick: any
}

export type DataPaginationProps = {
    initialItems: any[]
    setItems: any
    label?: string
}

export type FormPaginationProps = {
    label: string
    num: number
    setNum: any
    items: any[]
}

export type ImageLoaderProps = {
    setImage: any
    label?: string
}

export type QuantityProps = {
    num: number
    setNum: any
    part?: number
    min?: number
    max?: number
    label?:string
}

export type InformationPopupProps = {
    text: string
}

export type ContextPropsType = {
    account_id: string
    username: string
}

// Redux

export interface Waypoint {
    shortid: string
    title: string
    category: string
    surface: string
    cords: Cords
}

export interface RouteInitialState {
    currentCords: Cords
    waypoints: Waypoint[]
    distance: number
}

export interface RouteSlice {
    route: RouteInitialState
}