import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { checkAuthentication } from '../utils/auth';

const directiveName = 'authenticated';

export default function authenticatedDirective() {
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return (schema: GraphQLSchema) =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
        const directive =
          getDirective(schema, fieldConfig, directiveName)?.[0] ??
          typeDirectiveArgumentMaps[typeName];
        if (directive) {
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = async function (source, args, context, info) {
            checkAuthentication(context);

            return resolve(source, args, context, info);
          };
          return fieldConfig;
        }
        return null;
      },
    });
}
