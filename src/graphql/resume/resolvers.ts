import { errorResponse } from '../utils/common';
import { LISTS } from '../utils/constants';
import { getFarmsByUser } from '../utils/farm';

const {
  COLOR,
  STATE,
  STAGE,
  LOT,
  MEDICINE,
  WEIGHT,
  BREED,
  REPRODUCTION,
  GENDER,
  VACCINE,
} = LISTS;

const resolvers = {
  Query: {
    resumesByFarmMobile: async (root, { farmId }, { prisma }) => {
      if (farmId) {
        const animals = await prisma.animal.findMany({
          where: { farmId },
        });
        const resumes = await prisma.resume.findMany({
          where: {
            animalCode: { in: animals.map((animal) => animal.code) },
          },
        });

        return resumes || [];
      }
      return [];
    },
  },
  Mutation: {
    bulkUploadMobile: async (root, args, { prisma, user }) => {
      let validResumes = [];
      try {
        let farms = await getFarmsByUser(prisma, user);
        if (farms && farms.length > 0) {
          farms = farms.map((farm) => farm.id);
          for (const resume of args.resumes) {
            const farm = await prisma.animal
              .findUnique({ where: { code: resume.animalCode } })
              .farm();
            if (farm && farms.indexOf(farm.id) > -1) {
              const {
                modified, //exclude
                isNew, //exclude
                isValid, //exclude
                hasNewEvents, //exclude
                animalCode,
                birthday,
                initialWeight,
                registeredAt,
                ...data
              } = resume;

              const create = {
                ...data,
                birthday: new Date(birthday),
                initialWeight: parseFloat(initialWeight),
                registeredAt: new Date(registeredAt),
                updatedById: user.id,
              };

              const update = {
                name: data.name,
                caravan: data.caravan,
              };

              await prisma.resume.upsert({
                where: { animalCode },
                create,
                update,
              });
              validResumes.push(animalCode);
            }
          }

          for (const event of args.events) {
            const farm = await prisma.animal
              .findUnique({ where: { code: event.animalCode } })
              .farm();
            if (farm && farms.indexOf(farm.id) > -1) {
              const {
                isNew, //exclude
                eventId, //exclude
                animalCode,
                numericValue,
                registeredAt,
                ...rest
              } = event;

              animalCode: String!;

              const resume = await prisma.resume.findUnique({
                where: { animalCode: event.animalCode },
              });
              const data = {
                ...rest,
                resumeId: resume.id,
                numericValue: parseFloat(numericValue) || 0,
                registeredAt: new Date(registeredAt),
                updatedById: user.id,
              };

              await prisma.event.create({ data });
              if (validResumes.indexOf(animalCode) === -1) {
                validResumes.push(animalCode);
              }
            }
          }
        } else {
          validResumes = null;
        }
      } catch (e) {
        return errorResponse(e);
      }

      return {
        message: 'OK',
        status: 200,
        result: validResumes,
      };
    },
    bulkUploadExcel: async (
      root,
      { farmId, resumes, events },
      { prisma, user }
    ) => {
      const invalidData = [];
      const validResumes = [];
      const validEvents = [];

      try {
        const listItems = await prisma.listItem.findMany();
        const animals = await prisma.animal.findMany({
          where: { farmId },
        });

        const eventLists = [
          { id: STATE, name: 'Estado reproductivo' },
          { id: LOT, name: 'Lote' },
          { id: MEDICINE, name: 'Medicamento' },
          { id: WEIGHT, name: 'Peso' },
          { id: REPRODUCTION, name: 'Reproducción' },
          { id: VACCINE, name: 'Vacuna' },
        ];

        let sheetIndex = 1;
        let rowIndex = 2;

        const codeValid = (code: string) =>
          animals.some((animal) => animal.code === code);

        const getEventListId = (name: string) =>
          eventLists.find((element) => element.name === name)?.id || null;

        const getListItemId = (list: string | null, item: string) =>
          listItems.find(
            (listItem) => listItem.list === list && listItem.item === item
          )?.id || null;

        for (const resume of resumes) {
          const invalidColumns = [];

          const animalCode = String(resume.animalCode);
          if (!codeValid(animalCode)) {
            invalidColumns.push('Código');
          }

          const caravan = String(resume.caravan);

          let birthday = resume.birthday;
          try {
            if (typeof birthday === 'string') {
              const [day, month, year] = birthday.split('/');
              birthday = new Date(Number(year), Number(month) - 1, Number(day));
            } else {
              birthday = new Date(birthday);
            }
          } catch (e) {
            invalidColumns.push('Fecha de nacimiento');
          }

          const initialWeight = parseFloat(resume.initialWeight);
          if (Number.isNaN(initialWeight)) {
            invalidColumns.push('Peso');
          }

          const breedId = getListItemId(BREED, resume.breed);
          if (!breedId) {
            invalidColumns.push('Raza');
          }

          const stageId = getListItemId(STAGE, resume.stage);
          if (!stageId) {
            invalidColumns.push('Etapa de desarrollo');
          }

          const genderId = getListItemId(GENDER, resume.gender);
          if (!genderId) {
            invalidColumns.push('Sexo');
          }

          const colorId = getListItemId(COLOR, resume.color);
          if (!colorId) {
            invalidColumns.push('Color');
          }

          const name = String(resume.name);

          if (invalidColumns.length === 0) {
            validResumes.push({
              animalCode,
              animal: { connect: { animalCode } },
              image: null,
              caravan,
              birthday,
              initialWeight,
              breedId,
              stageId,
              genderId,
              colorId,
              name,
              registeredAt: new Date(),
              updatedById: user.id,
            });
          } else {
            invalidData.push({
              key: `${sheetIndex}${rowIndex}`,
              sheet: sheetIndex,
              row: rowIndex,
              columns: [...invalidColumns],
            });
          }
          rowIndex += 1;
        }

        sheetIndex = 2;
        rowIndex = 2;

        for (const event of events) {
          const invalidColumns = [];

          const animalCode = String(event.animalCode);
          if (!codeValid(animalCode)) {
            invalidColumns.push('Código');
          }

          const listId = getEventListId(event.list);
          if (!listId) {
            invalidColumns.push('Tipo');
          }

          const listItemId = getListItemId(
            listId,
            listId === WEIGHT ? 'Kilos' : event.item
          );
          if (!listItemId) {
            invalidColumns.push('Evento');
          }

          let numericValue = null;
          if (listId === WEIGHT) {
            numericValue = parseFloat(event.item);
            if (Number.isNaN(numericValue)) {
              invalidColumns.push('Evento');
            }
          }

          const comments = event.comments;

          if (invalidColumns.length === 0) {
            const resume = await prisma.resume.findUnique({ animalCode });
            validEvents.push({
              resumeId: resume.id,
              listItemId,
              numericValue,
              image: null,
              comments,
              registeredAt: new Date(),
              updatedById: user.id,
            });
          } else {
            invalidData.push({
              key: `${sheetIndex}${rowIndex}`,
              sheet: sheetIndex,
              row: rowIndex,
              columns: [...invalidColumns],
            });
          }
          rowIndex += 1;
        }

        if (invalidData.length === 0) {
          console.log('resumes', resumes);
          console.log('events', events);
          // upsertManyResumes
          // await prisma.resume.upsert({
          //   where: { animalCode },
          //   create,
          //   update,
          // });
          // upsertManyEvents
          // await prisma.event.upsert({
          //   where: { id: '' },
          //   update: data,
          //   create: data,
          // });
        }
      } catch (e) {
        return errorResponse(e);
      }

      return {
        invalidData,
        status: 200,
        result: true,
      };
    },
  },
  Resume: {
    events: (parent, args, { prisma }) =>
      prisma.farm
        .findUnique({
          where: { id: parent.id },
        })
        .events(),
  },
  Event: {
    listItem: (parent, args, { prisma }) =>
      prisma.farm
        .findUnique({
          where: { id: parent.id },
        })
        .listItem(),
  },
};

export default resolvers;
