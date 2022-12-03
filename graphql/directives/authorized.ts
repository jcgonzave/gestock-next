import { GraphQLSchema, defaultFieldResolver } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { checkAuthentication, checkAuthorization } from '../utils/auth';

const directiveName = 'authorized';

export default function authorizedDirective() {
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return (schema: GraphQLSchema) =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
        const directive =
          getDirective(schema, fieldConfig, directiveName)?.[0] ??
          typeDirectiveArgumentMaps[typeName];
        if (directive) {
          const { module } = directive;
          if (module) {
            const { resolve = defaultFieldResolver } = fieldConfig;
            fieldConfig.resolve = async function (source, args, context, info) {
              checkAuthentication(context);
              await checkAuthorization(context, module);

              return resolve(source, args, context, info);
            };
            return fieldConfig;
          }
        }
      },
    });
}
