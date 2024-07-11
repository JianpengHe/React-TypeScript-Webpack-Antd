import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import zhCN from 'antd/locale/zh_CN'
import 'antd/dist/reset.css'
import '/index.less'
import { ConfigProvider } from 'antd'

ReactDOM.createRoot(document.getElementById('root') || document.body).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
