import {
  ApolloClient,
  from,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { message } from 'antd';
import { createUploadLink } from 'apollo-upload-client';
import merge from 'deepmerge';
import isEqual from 'lodash/isEqual';
import { useMemo } from 'react';
import t from '../translations/es';

const showError = (error: string) => {
  message.error(error);
};

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      const translation =
        t.messages[message.replace('Error: ', '') as keyof typeof t.messages];
      showError(translation || message);
    });
  }
  if (networkError) {
    console.log('Error 401');
  }
});

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createApolloClient() {
  const httpLink = createUploadLink({
    uri: `${process.env.SERVER_URL ?? 'http://localhost:3000'}/api/graphql`,
    credentials: 'same-origin',
    headers: {
      'Apollo-Require-Preflight': 'true',
    },
  });

  return new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState?: any) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the initialState from getStaticProps/getServerSideProps in the existing cache
    const data = merge(existingCache, initialState, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }

  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState?: any) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
