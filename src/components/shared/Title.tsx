type Props = {
  text: string;
};

const Title: React.FC<Props> = ({ text }) => (
  <h1 className='custom-title'>{text}</h1>
);

export default Title;
