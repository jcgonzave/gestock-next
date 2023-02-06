import { useRouter } from 'next/router';
import en from './en';
import es from './es';

const useTranslation = () => {
  const { locale } = useRouter();
  if (locale === 'en') {
    return en;
  }
  return es;
};

export { useTranslation };
