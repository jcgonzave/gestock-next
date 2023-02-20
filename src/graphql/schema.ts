import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs } from '@graphql-tools/merge'
import { authenticated, authorized } from './directives';

import animal from './animal/resolvers';
import { typeDefs as animalType } from './animal/types';
import auth from './auth/resolvers';
import { typeDefs as authType } from './auth/types';
import common from './common/resolvers';
import { typeDefs as commonType } from './common/types';
import farm from './farm/resolvers';
import { typeDefs as farmType } from './farm/types';
import listItem from './listItem/resolvers';
import { typeDefs as listItemType } from './listItem/types';
import report from './report/resolvers';
import { typeDefs as reportTypes } from './report/types';
import resume from './resume/resolvers';
import { typeDefs as resumeType } from './resume/types';
import role from './role/resolvers';
import { typeDefs as roleType } from './role/types';
import user from './user/resolvers';
import { typeDefs as userType } from './user/types';

const types = [ animalType, authType, commonType, farmType, listItemType, reportTypes, resumeType, roleType, userType ];
let schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs(types),
  resolvers:  [animal, auth, common, farm, listItem, report, resume, role, user],
});

schema = authenticated()(schema);
schema = authorized()(schema);

export { schema };
