import { Col, Layout as LayoutAntd, Row } from 'antd';
import Navbar from './Navbar';

const { Header, Footer, Content } = LayoutAntd;

const Layout: React.FC<{
  layoutType: 'ADMIN' | 'USER';
  children: any;
}> = ({ layoutType, children }) => {
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
      <Footer>Copyright © 2022 Gestock - Todos los derechos reservados.</Footer>
    </LayoutAntd>
  );
};

export default Layout;
