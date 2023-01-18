import gql from 'graphql-tag';
import { response } from '../common/client';

export const ANIMAL_MASTERS = gql`
  query AnimalMasters {
    farms {
      id
      name
    }
  }
`;

export const ANIMALS = gql`
  query Animals {
    animals {
      id
      code
      farm {
        id
        name
      }
    }
  }
`;

export const ANIMAL = gql`
  query Animal($id: String!) {
    animal(id: $id) {
      id
      code
      farm {
        id
        name
        farmer {
          id
        }
      }
    }
  }
`;

export const UPSERT_ANIMAL = gql`
  mutation UpsertAnimal($animal: AnimalInput!) {
    upsertAnimal(animal: $animal) {
      ${response}
    }
  }
`;

export const DELETE_ANIMAL = gql`
  mutation DeleteAnimal($id: String!) {
    deleteAnimal(id: $id) {
      ${response}
    }
  }
`;
