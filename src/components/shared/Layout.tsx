import { Col, Layout as LayoutAntd, Row } from 'antd';
import { useTranslation } from '../../translations';
import Navbar from './Navbar';

const { Header, Footer, Content } = LayoutAntd;

const Layout: React.FC<{
  layoutType: 'ADMIN' | 'USER';
  children: any;
}> = ({ layoutType, children }) => {
  const t = useTranslation();
  return (
    <LayoutAntd>
      <Header>
        <Navbar layoutType={layoutType} />
      </Header>
      <Content>
        <Row>
          <Col span={22} offset={1}>
            {children}
          </Col>
        </Row>
      </Content>
      <Footer>{t.general.copyRight}</Footer>
    </LayoutAntd>
  );
};

export default Layout;
