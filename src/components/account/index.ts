import PersonalProfileInfo from './PersonalProfileInfo'
import GeoProfileInfo from './GeoProfileInfo'
import ProfileSecurity from './ProfileSecurity'
import ProfileBicycles from './ProfileBicycles'
import ProfileRoute from './ProfileRoute'
import ProfileComponents from './ProfileComponents'

import {AccountPageComponentType} from '../../types/types'

const components: AccountPageComponentType[] = [
    {
        title: 'Profile',
        icon: 'https://img.icons8.com/ios/50/edit-user-male.png',
        component: PersonalProfileInfo
    },
    {
        title: 'Location',
        icon: 'https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/external-location-modern-business-and-business-essentials-flatart-icons-outline-flatarticons.png',
        component: GeoProfileInfo
    },
    {
        title: 'Security',
        icon: 'https://img.icons8.com/dotty/80/security-configuration.png',
        component: ProfileSecurity
    },
    {
        title: 'Bicycles',
        icon: 'https://img.icons8.com/ios-filled/50/bicycle.png',
        component: ProfileBicycles
    },
    {
        title: 'Route',
        icon: 'https://img.icons8.com/pastel-glyph/64/waypoint.png',
        component: ProfileRoute
    },
    {
        title: 'Components',
        icon: 'https://img.icons8.com/dotty/80/list.png',
        component: ProfileComponents
    }
]

export const default_component = components[0]

export default components