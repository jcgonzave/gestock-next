import { ListEnum } from '../enums';
import { ContextType } from '../types';
import { errorResponse } from '../utils/responses';

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
} = ListEnum;

const resolvers = {
  Query: {
    resumesByFarmMobile: async (
      _: unknown,
      args: { farmId: string },
      context: ContextType
    ) => {
      const { farmId } = args;
      const { prisma } = context;
      const animals = await prisma.animal.findMany({
        where: { farmId },
      });
      const resumes = await prisma.resume.findMany({
        where: {
          animalCode: { in: animals.map((animal) => animal.code) },
        },
      });

      return resumes || [];
    },
  },
  Mutation: {
    bulkUploadMobile: async (
      _: unknown,
      args: { farmId: string; resumes: any[]; events: any[] },
      context: ContextType
    ) => {
      try {
        const { farmId, resumes, events } = args;
        const { prisma, currentUser } = context;
        const validResumes = [];
        const validEvents = [];
        const validCodes = [];

        const animals = await prisma.animal.findMany({
          where: { farmId },
        });

        const codeValid = (code: string) =>
          animals.some((animal) => animal.code === code);

        for (const resume of resumes) {
          if (codeValid(resume.animalCode)) {
            const {
              modified, //exclude
              isNew, //exclude
              isValid, //exclude
              hasNewEvents, //exclude
              birthday,
              initialWeight,
              registeredAt,
              ...data
            } = resume;

            validResumes.push({
              ...data,
              image: '',
              birthday: new Date(birthday),
              initialWeight: parseFloat(initialWeight),
              registeredAt: new Date(registeredAt),
              updatedById: currentUser.id,
            });
            validCodes.push(resume.animalCode);
          }
        }

        if (validResumes.length > 0) {
          await prisma.$transaction(
            validResumes.map((resume) =>
              prisma.resume.upsert({
                where: { animalCode: resume.animalCode },
                update: { name: resume.name, caravan: resume.caravan },
                create: resume,
              })
            )
          );
        }

        for (const event of events) {
          if (codeValid(event.animalCode)) {
            const resume = await prisma.resume.findUnique({
              where: { animalCode: event.animalCode },
            });
            if (resume) {
              const {
                isNew, //exclude
                eventId, //exclude
                animalCode, //exclude
                numericValue,
                registeredAt,
                ...rest
              } = event;

              validEvents.push({
                ...rest,
                resumeId: resume.id,
                image: '',
                numericValue: parseFloat(numericValue) || 0,
                registeredAt: new Date(registeredAt),
                updatedById: currentUser.id,
              });
              if (!validCodes.some((code) => code === event.animalCode)) {
                validCodes.push(event.animalCode);
              }
            }
          }
        }

        if (validEvents.length > 0) {
          await prisma.event.createMany({
            data: validEvents,
          });
        }

        return {
          message: 'OK',
          status: 200,
          result: validCodes.length > 0 ? validCodes : null,
        };
      } catch (e) {
        return errorResponse(e);
      }
    },
    bulkUploadExcel: async (
      _: unknown,
      args: { farmId: string; resumes: any[]; events: any[] },
      context: ContextType
    ) => {
      try {
        const { farmId, resumes, events } = args;
        const { prisma, currentUser } = context;
        const invalidData = [];
        const validResumes = [];
        const validEvents = [];

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
          )?.id || '';

        for (const resume of resumes) {
          const invalidColumns = [];

          const animalCode = resume.animalCode;
          if (!codeValid(animalCode)) {
            invalidColumns.push('Código');
          }

          const caravan = resume.caravan;

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

          const name = resume.name;

          if (invalidColumns.length === 0) {
            validResumes.push({
              animalCode,
              image: '',
              caravan,
              birthday,
              initialWeight,
              breedId,
              stageId,
              genderId,
              colorId,
              name,
              registeredAt: new Date(),
              updatedById: currentUser.id,
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

          let resume;
          const animalCode = event.animalCode;
          if (!codeValid(animalCode)) {
            invalidColumns.push('Código');
          } else {
            resume = await prisma.resume.findUnique({
              where: { animalCode },
            });
            if (!resume) {
              invalidColumns.push('Código');
            }
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

          if (invalidColumns.length === 0 && resume) {
            validEvents.push({
              resumeId: resume.id,
              listItemId,
              numericValue,
              image: '',
              comments,
              registeredAt: new Date(),
              updatedById: currentUser.id,
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
          await prisma.$transaction(
            validResumes.map((resume) =>
              prisma.resume.upsert({
                where: { animalCode: resume.animalCode },
                update: { name: resume.name, caravan: resume.caravan },
                create: resume,
              })
            )
          );
          await prisma.event.createMany({
            data: validEvents,
          });
        }

        return {
          invalidData,
          status: 200,
          result: true,
        };
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  Resume: {
    events: (parent: { id: string }, _args: unknown, context: ContextType) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.resume.findUnique({ where: { id } }).events();
    },
  },
  Event: {
    listItem: (
      parent: { id: string },
      _args: unknown,
      context: ContextType
    ) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.event.findUnique({ where: { id } }).listItem();
    },
  },
};

export default resolvers;
