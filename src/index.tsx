import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ApolloClient from 'apollo-boost'
import {ApolloProvider} from '@apollo/react-hooks'
import {Provider} from 'react-redux'
import {WebProvider} from './context/WebProvider'
import {WEBSERVER_URL} from './env/env'
import store from './store/store'

const client: any = new ApolloClient({
  uri: WEBSERVER_URL + '/graphql'
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <WebProvider>
      <Provider store={store}>
      <App />
      </Provider>
      </WebProvider>
    </ApolloProvider>
  </React.StrictMode>
)

reportWebVitals()
