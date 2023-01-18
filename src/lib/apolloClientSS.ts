import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import { schema } from '../graphql/schema';

type SchemaContext =
  | SchemaLink.ResolverContext
  | SchemaLink.ResolverContextFunction;

export function createApolloClient(context: SchemaContext) {
  return new ApolloClient({
    ssrMode: true,
    link: new SchemaLink({ schema, context }),
    cache: new InMemoryCache(),
  });
}

export function addApolloState(
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: { props: any }
) {
  pageProps.props.initialApolloState = client.cache.extract();

  return pageProps;
}
