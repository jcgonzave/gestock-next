import { createWriteStream, unlink } from 'fs';

const storeUpload = async ({
  stream,
  filename,
}: any): Promise<{ name: string; path: string }> => {
  const extension = filename.split('.')[1];
  const name = `${new Date().getTime()}.${extension}`;
  const path = `./static/images/${name}`;

  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ name, path }))
      .on('error', reject)
  );
};

const processFile = async (file: any) => {
  if (!file) {
    return { name: null, path: null };
  }
  const { createReadStream, filename } = await file;
  const stream = createReadStream();
  const { name, path } = await storeUpload({
    stream,
    filename,
  });
  return {
    name,
    path,
  };
};

const deleteFile = (path: string) => {
  unlink(path, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

export { processFile, deleteFile };
