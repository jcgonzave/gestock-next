const resolvers = {
  Query: {
    states: () => [
      { id: 'ACTIVE', name: 'Activo' },
      { id: 'INACTIVE', name: 'Inactivo' },
    ],
  },
};

export default resolvers;
