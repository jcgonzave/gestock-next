import Excel from 'exceljs';
import { errorResponse } from '../utils/common';
import { LISTS } from '../utils/constants';
import { deleteFile, processFile } from '../utils/processFile';

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
  Mutation: {
    upload: async (root, args, { prisma, user }) => {
      const invalidDataLocations = [];
      let resumesUploadedCount = 0;
      let eventsUploadedCount = 0;

      try {
        const listItems = await prisma.listItems();
        const animals = await prisma.animals({
          where: { farm: { id: args.farmId } },
        });

        const eventLists = [
          { id: STATE, name: 'Estado reproductivo' },
          { id: LOT, name: 'Lote' },
          { id: MEDICINE, name: 'Medicamento' },
          { id: WEIGHT, name: 'Peso' },
          { id: REPRODUCTION, name: 'Reproducción' },
          { id: VACCINE, name: 'Vacuna' },
        ];

        const { originFileObj } = args.file;
        const { path } = await processFile(originFileObj);

        const workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(path);

        let sheetIndex = 0;
        let worksheet = workbook.worksheets[sheetIndex];
        let rowIndex = 2;
        let row = worksheet.getRow(rowIndex);

        const codeValid = (value) =>
          Boolean(animals.find((element) => element.code === value));

        const getEventListId = (value) => {
          const eventList = eventLists.find(
            (element) => element.name === value
          );
          if (eventList) {
            return eventList.id;
          }
          return null;
        };

        const getTimeListId = (value) => {
          const timeList = timeLists.find((element) => element.name === value);
          if (timeList) {
            return timeList.id;
          }
          return null;
        };

        const getListItemId = (list, value) => {
          const listItem = listItems.find(
            (element) => element.list === list && element.item === value
          );
          if (listItem) {
            return listItem.id;
          }
          return null;
        };

        let code = row.getCell(1).value;

        while (code !== null) {
          const invalidColumns = [];

          code = String(code);
          if (!codeValid(code)) {
            invalidColumns.push('Código');
          }

          const caravan = String(row.getCell(2).value);

          let birthday = row.getCell(3).value;
          try {
            if (typeof birthday === 'string') {
              const array = birthday.split('/');
              birthday = new Date(
                Number(array[2], Number(array[1] - 1, Number(array[0])))
              );
            } else {
              birthday = new Date(birthday);
            }
          } catch (e) {
            invalidColumns.push('Fecha de nacimiento');
          }

          const initialWeight = parseFloat(row.getCell(4).value, 10);
          if (Number.isNaN(initialWeight)) {
            invalidColumns.push('Peso');
          }

          const breed = getListItemId(BREED, row.getCell(5).value);
          if (!breed) {
            invalidColumns.push('Raza');
          }

          const stage = getListItemId(STAGE, row.getCell(6).value);
          if (!stage) {
            invalidColumns.push('Etapa de desarrollo');
          }

          const gender = getListItemId(GENDER, row.getCell(7).value);
          if (!gender) {
            invalidColumns.push('Sexo');
          }

          const color = getListItemId(COLOR, row.getCell(8).value);
          if (!color) {
            invalidColumns.push('Color');
          }

          const name = String(row.getCell(9).value);

          if (invalidColumns.length === 0) {
            const create = {
              code,
              animal: { connect: { code } },
              image: null,
              caravan,
              birthday,
              initialWeight,
              breed: {
                connect: { id: breed },
              },
              stage: {
                connect: { id: stage },
              },
              gender: {
                connect: { id: gender },
              },
              color: {
                connect: { id: color },
              },
              name,
              created: new Date(),
              updatedBy: { connect: { id: user.id } },
            };

            const update = {
              caravan,
              name,
            };

            await prisma.upsertResume({
              where: { code },
              create,
              update,
            });
            resumesUploadedCount += 1;
          } else {
            invalidDataLocations.push({
              key: `${sheetIndex}${rowIndex}`,
              sheet: sheetIndex + 1,
              row: rowIndex,
              columns: [...invalidColumns],
            });
          }

          rowIndex += 1;
          row = worksheet.getRow(rowIndex);
          code = row.getCell(1).value;
        }

        sheetIndex = 1;
        worksheet = workbook.worksheets[sheetIndex];
        rowIndex = 2;
        row = worksheet.getRow(rowIndex);

        code = row.getCell(1).value;

        while (code !== null) {
          const invalidColumns = [];

          code = String(code);
          if (!codeValid(code)) {
            invalidColumns.push('Código');
          }

          const listId = getEventListId(row.getCell(2).value);
          if (!listId) {
            invalidColumns.push('Tipo');
          }

          const listItem = getListItemId(
            listId,
            listId === WEIGHT ? 'Kilos' : row.getCell(3).value
          );
          if (!listItem) {
            invalidColumns.push('Nombre');
          }

          const numericValue = parseFloat(row.getCell(4).value, 10) || 0;
          if (Number.isNaN(numericValue)) {
            invalidColumns.push('Valor');
          }

          const comments = getTimeListId(row.getCell(6).value);

          if (invalidColumns.length === 0) {
            const resume = await prisma.resume({ code });
            const data = {
              resume: { connect: { id: resume.id } },
              listItem: { connect: { id: listItem } },
              numericValue,
              image: null,
              comments,
              created: new Date(),
              updatedBy: { connect: { id: user.id } },
            };

            await prisma.upsertEvent({
              where: { id: '' },
              update: data,
              create: data,
            });
            eventsUploadedCount += 1;
          } else {
            invalidDataLocations.push({
              key: `${sheetIndex}${rowIndex}`,
              sheet: sheetIndex + 1,
              row: rowIndex,
              columns: [...invalidColumns],
            });
          }

          rowIndex += 1;
          row = worksheet.getRow(rowIndex);
          code = row.getCell(1).value;
        }

        deleteFile(path);
      } catch (e) {
        return errorResponse(e);
      }

      return {
        invalidDataLocations,
        resumesUploadedCount,
        eventsUploadedCount,
        status: 200,
        result: true,
      };
    },
  },
};

export default resolvers;
