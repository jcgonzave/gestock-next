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
        where: { code: { in: animals.map((animal) => animal.code) } },
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
          if (codeValid(resume.code)) {
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
            validCodes.push(resume.code);
          }
        }

        if (validResumes.length > 0) {
          await prisma.$transaction(
            validResumes.map((resume) =>
              prisma.resume.upsert({
                where: { code: resume.code },
                update: { name: resume.name, caravan: resume.caravan },
                create: resume,
              })
            )
          );
        }

        for (const event of events) {
          if (codeValid(event.code)) {
            const resume = await prisma.resume.findUnique({
              where: { code: event.code },
            });
            if (resume) {
              const {
                isNew, //exclude
                eventId, //exclude
                code, //exclude
                list, //exclude
                item: listItemId,
                numericValue,
                registeredAt,
                ...rest
              } = event;

              validEvents.push({
                ...rest,
                resumeId: resume.id,
                listItemId,
                image: '',
                numericValue: parseFloat(numericValue) || 0,
                registeredAt: new Date(registeredAt),
                updatedById: currentUser.id,
              });
              if (!validCodes.some((validCode) => validCode === event.code)) {
                validCodes.push(event.code);
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

          const code = resume.code;
          if (!codeValid(code)) {
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
              code,
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

          const code = event.code;
          if (!codeValid(code)) {
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
            validEvents.push({
              code,
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
                where: { code: resume.code },
                update: { name: resume.name, caravan: resume.caravan },
                create: resume,
              })
            )
          );

          const eventsWithResume = [];
          rowIndex = 2;
          for (const event of validEvents) {
            const resume = await prisma.resume.findUnique({
              where: { code: event.code },
            });
            if (resume) {
              const { code, ...rest } = event;
              eventsWithResume.push({ ...rest, resumeId: resume.id });
            } else {
              invalidData.push({
                key: `2${rowIndex}`,
                sheet: 2,
                row: rowIndex,
                columns: ['Código'],
              });
            }
            rowIndex += 1;
          }

          if (eventsWithResume.length === validEvents.length) {
            await prisma.event.createMany({
              data: eventsWithResume,
            });
          }
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
    birthday: (parent: { birthday: number }) =>
      new Date(parent.birthday).toISOString(),
    registeredAt: (parent: { registeredAt: number }) =>
      new Date(parent.registeredAt).toISOString(),
  },
  Event: {
    resume: (parent: { id: string }, _args: unknown, context: ContextType) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.event.findUnique({ where: { id } }).resume();
    },
    listItem: (
      parent: { id: string },
      _args: unknown,
      context: ContextType
    ) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.event.findUnique({ where: { id } }).listItem();
    },
    registeredAt: (parent: { registeredAt: number }) =>
      new Date(parent.registeredAt).toISOString(),
  },
};

export default resolvers;
