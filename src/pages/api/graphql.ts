import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { server } from '../../lib/apolloServer';
import { clientContext } from '../../graphql/context';

export default startServerAndCreateNextHandler(server, {
  context: clientContext,
});
