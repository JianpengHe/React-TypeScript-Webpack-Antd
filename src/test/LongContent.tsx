import { useBoolean, useRequest } from 'ahooks'
import { Button, Card, Form, Modal, Table } from 'antd'
import axios from 'axios'
import React, { useCallback, useMemo } from 'react'
import { TestForm, TestForm2, TestForm3 } from './TestForm'
import { T } from './T'
import FormTable from './FormTable'
import App from './T2'
import FormTableT from './FormTableT'
import { BetaSchemaForm } from '@ant-design/pro-form'

interface IProps {}
export const LongContent: React.FC<IProps> = ({}) => {
  const [open, { setTrue, setFalse }] = useBoolean(false)
  const { data, loading, run } = useRequest(axios.get, {
    manual: true,
    onSuccess() {
      setTrue()
    },
  })
  const onClick = useCallback(() => run('/'), [run])
  const list = useMemo(
    () =>
      Array(26)
        .fill(0)
        .map((_, i) => (i + 10).toString(36).toUpperCase()),
    []
  )
  const dataSource = useMemo(
    () =>
      Array(6)
        .fill(0)
        .map(() => list.reduce((obj, a) => ({ ...obj, [a]: a.repeat(Math.random() * 20 + 6) }), {})),
    [list]
  )
  return (
    <div>
      <BetaSchemaForm
        className="fgjiifgj"
        layoutType="Embed"
        columns={[
          {
            title: '标题',
            dataIndex: 'title',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '此项为必填项',
                },
              ],
            },
            width: 'md',
            colProps: {
              xs: 24,
              md: 12,
            },
            initialValue: '默认值',
            convertValue: value => {
              return `标题：${value}`
            },
            transform: value => {
              return {
                title: `${value}-转换`,
              }
            },
          },
          {
            title: '状态',
            dataIndex: 'state',
            valueType: 'select',
            width: 'md',
            colProps: {
              xs: 24,
              md: 12,
            },
          },
        ]}
        grid
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
      />
      {/* <TestForm3></TestForm3>
      <Card title={'tabList(statisticsData)'} bodyStyle={{ padding: 0 }} tabBarExtraContent={<div>666666</div>} />
      <Modal title="请求结果" open={open} onCancel={setFalse}>
        {String(data?.data || '')}
      </Modal> */}
      {/* <FormTableT></FormTableT> */}
      <FormTable></FormTable>
      <p>long content</p>
      {
        // indicates very long content
        Array.from({ length: 100 }, (_, index) => (
          <React.Fragment key={index}>
            {index % 20 === 0 && index ? 'more' : '...'}
            <br />
          </React.Fragment>
        ))
      }
    </div>
  )
}
