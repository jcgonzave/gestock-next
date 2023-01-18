import Login from '../components/auth/Login';

const LoginPage = () => {
  return <Login />;
};

export async function getStaticProps() {
  return { props: {} };
}

export default LoginPage;
