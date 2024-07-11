import React from 'react'
import dayjs from 'dayjs'
import { UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import { LongContent } from '/test/LongContent'
import styled from 'styled-components'

const { Header, Content, Sider } = Layout
dayjs.locale('zh-cn')
const Logo = styled.div`
  color: #fff;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  margin: 10px;
  > img {
    border-radius: 50%;
    width: 50px;
    height: 50px;
  }
`
const App: React.FC = () => (
  <Layout style={{ height: '100vh', display: 'flex' }}>
    <Sider breakpoint="lg" collapsedWidth="0" style={{ height: '100vh' }} className="scrollbar">
      <Logo>
        <img src="profile_img.jpg" />
        <span>You Logo</span>
      </Logo>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['4']}
        items={[UserOutlined, VideoCameraOutlined, UploadOutlined, UserOutlined].map((icon, index) => ({
          key: String(index + 1),
          icon: React.createElement(icon),
          label: `nav ${index + 1}`,
        }))}
      />
    </Sider>
    <Layout style={{ height: '100vh' }} className="scrollbar">
      <Header className="site-layout-sub-header-background" style={{ padding: 0 }}>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={new Array(15).fill(null).map((_, index) => {
            const key = index + 1
            return {
              key,
              label: `nav ${key}`,
            }
          })}
        />
      </Header>
      <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
        <LongContent />
      </Content>
    </Layout>
  </Layout>
)

export default App
