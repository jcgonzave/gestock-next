import { makeExecutableSchema } from '@graphql-tools/schema';
import animal from './animal/resolvers';
import auth from './auth/resolvers';
import common from './common/resolvers';
import { authenticated, authorized } from './directives';
import farm from './farm/resolvers';
import listItem from './listItem/resolvers';
import report from './report/resolvers';
import resume from './resume/resolvers';
import role from './role/resolvers';
import user from './user/resolvers';

import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';

const typeDefs = loadSchemaSync('src/**/*.graphql', {
  loaders: [new GraphQLFileLoader()],
});

let schema = makeExecutableSchema({
  typeDefs,
  resolvers: [animal, auth, common, farm, listItem, report, resume, role, user],
});

schema = authenticated()(schema);
schema = authorized()(schema);

export { schema };
