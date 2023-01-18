import { ApolloProvider } from '@apollo/client';
import { NextComponentType } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Layout, Loading } from '../components/shared';
import useRouteChange from '../hooks/useRouteChange';
import { useApollo } from '../lib/apolloClient';

type LayuoutType = 'ADMIN' | 'USER' | undefined;

type CustomAppProps = AppProps & {
  Component: NextComponentType & { layoutType: LayuoutType };
};

export default function App({ Component, pageProps }: CustomAppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState);
  const loading = useRouteChange();

  return (
    <>
      <ApolloProvider client={apolloClient}>
        <Head>
          <title>Gestock</title>
          <meta name='description' content='Gestock' />
          <link rel='icon' href='/favicon.ico' />
          <meta charSet='utf-8' />
          <meta
            name='viewport'
            content='initial-scale=1.0, width=device-width'
          />
        </Head>

        {!Component.layoutType ? (
          <Component {...pageProps} />
        ) : (
          <Layout {...pageProps} layoutType={Component.layoutType}>
            <Component {...pageProps} />
          </Layout>
        )}
      </ApolloProvider>
      {loading && <Loading />}
    </>
  );
}
