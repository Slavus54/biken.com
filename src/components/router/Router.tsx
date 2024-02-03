import React from 'react'
import {Route} from 'wouter'
import RouterItem from './RouterItem'
import routes from '../../env/routes.json'
import {ContextPropsType} from '../../types/types'

import Home from '../pages/Home'
import Register from '../pages/Register'
import Login from '../pages/Login'
import CreateItinerary from '../pages/CreateItinerary'
import Itineraries from '../pages/Itineraries'
import Itinerary from '../pages/Itinerary'
import CreateBike from '../pages/CreateBike'
import Bikes from '../pages/Bikes'
import Bike from '../pages/Bike'
import CreateTrick from '../pages/CreateTrick'
import Tricks from '../pages/Tricks'
import Trick from '../pages/Trick'
import CreatePlace from '../pages/CreatePlace'
import Places from '../pages/Places'
import Place from '../pages/Place'
import CreateCyclist from '../pages/CreateCyclist'
import Cyclists from '../pages/Cyclists'
import Cyclist from '../pages/Cyclist'
import CreateProduct from '../pages/CreateProduct'
import Products from '../pages/Products'
import Product from '../pages/Product'
import Profiles from '../pages/Profiles'
import Profile from '../pages/Profile'

const Router: React.FC<ContextPropsType> = ({account_id, username}) => {

    return (
        <>
            <div className='navbar'>
                {routes.filter(el => account_id.length === 0 ? el.access_value < 1 : el.access_value > -1).map(el => <RouterItem title={el.title} url={el.url} />)}
            </div>
     
            <Route path='/'><Home account_id={account_id} username={username} /></Route> 
            <Route component={Register} path='/register' />    
            <Route component={Login} path='/login' /> 
            <Route component={CreateItinerary} path='/create-itinerary/:id' />       
            <Route component={Itineraries} path='/itineraries' />       
            <Route component={Itinerary} path='/itinerary/:id' />      
            <Route component={CreateBike} path='/create-bike/:id' />  
            <Route component={Bikes} path='/bikes' /> 
            <Route component={Bike} path='/bike/:id' /> 
            <Route component={CreateTrick} path='/create-trick/:id' />  
            <Route component={Tricks} path='/tricks' />  
            <Route component={Trick} path='/trick/:id' />  
            <Route component={CreatePlace} path='/create-place/:id' />  
            <Route component={Places} path='/places' />  
            <Route component={Place} path='/place/:id' />  
            <Route component={CreateCyclist} path='/create-cyclist/:id' />  
            <Route component={Cyclists} path='/cyclists' />  
            <Route component={Cyclist} path='/cyclist/:id' />  
            <Route component={CreateProduct} path='/create-product/:id' /> 
            <Route component={Products} path='/products' /> 
            <Route component={Product} path='/product/:id' /> 
            <Route component={Profiles} path='/profiles' />
            <Route component={Profile} path='/profile/:id' />
        </>
    )
}

export default Router