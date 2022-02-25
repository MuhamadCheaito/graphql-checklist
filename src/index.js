import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache, HttpLink
} from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri:'https://selected-magpie-98.hasura.app/v1/graphql',
    headers: {
      'content-type': 'application/json',
      'x-hasura-admin-secret':'GNU1KmFTMtaE2LIFJGR6mv4h1NUo962bHwyOXV3V3V1fDdSEFrJCed2ssbu8aWGx'
    }
  }),
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);