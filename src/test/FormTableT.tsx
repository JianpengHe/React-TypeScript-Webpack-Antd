import ProForm, { ProFormList, ProFormListProps, ProFormText } from '@ant-design/pro-form'
import ProTable, { EditableProTable, EditableProTableProps, ProColumns } from '@ant-design/pro-table'
import { Button, Form, FormInstance } from 'antd'
import { NamePath } from 'antd/lib/form/interface'
import React, { useEffect, useMemo } from 'react'
import Field from '@ant-design/pro-field'
import { InlineErrorFormItem } from '@ant-design/pro-utils'
import styled from 'styled-components'
import { PlusOutlined } from '@ant-design/icons'

const Styled = styled.div`
  td.ant-table-cell {
    vertical-align: top;
  }
  .ant-table-cell:empty {
    padding: 0 !important;
    border: none !important;
  }
  .ProFormList {
    margin: 0;
  }
  .ProFormList .list-item {
    display: flex;
    align-items: flex-start;
    min-height: 40px;
  }

  .ProFormList .list-item .ant-pro-form-list-action {
    margin: 4px 0;
  }

  .ProFormList .list-item .ant-pro-form-list-action > .anticon {
    margin-left: 0;
    margin-right: 8px;
  }
  .ProFormList .ant-form-item-control-input-content > div > button {
    height: 32px;
    margin: 0 0 8px 0;
  }
  .ProFormList .ant-form-item {
    margin: 0;
    margin-block: 0 !important;
  }
  .ProFormList .ant-pro-form-list-container {
    width: 100%;
  }
  .ProFormItem {
    padding: 4px 0;
  }
  .ProFormListItem:last-of-type {
    min-height: 40px !important;
  }
`
type StringRecord = Record<string, any>

const FormTableT: React.FC = () => {
  const [form] = ProForm.useForm<FormData>()
  const dataSource = ProForm.useWatch('list', form)

  useEffect(() => {
    if (!form) return
    console.log('set')
    form.setFieldValue('list', [
      {
        __index: 0,
        p: 'gd',
        cs: [
          { c: '广州', as: [{ a: '天河', ss: [{ s: '石牌桥' }, { s: '五山' }] }] },
          {
            c: '深圳',
            as: [
              { a: '南山', ss: [{ s: '粤海' }, { s: '蛇口' }] },
              { a: '宝安', ss: [{ s: '新安' }] },
              { a: '福田', ss: [{ s: '下沙' }] },
            ],
          },
        ],
      },
      { __index: 1, p: 'gx', cs: [{ c: '桂林', as: [{ a: '叠彩', ss: [{ s: '下沙' }] }] }] },
    ])
    // form.setFieldValue('c', '去root了')
  }, [form])
  const columns = useMemo(() => {
    const data: FormTableColumn<{}>[] = [
      { dataIndex: '__index', hideInTable: true },
      {
        title: '省份名称',
        dataIndex: 'p',
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项是必填项',
            },
          ],
        },
        valueType: 'select',
        valueEnum: {
          gd: '广东',
          gx: '广西',
        },
      },
      {
        title: '城市',
        dataIndex: 'cs',
        formListProps: {
          creatorRecord: { c: '', as: [{ a: '', ss: [{ s: '' }] }] },
          min: 1,
        },
        children: [
          {
            title: '城市名称',
            dataIndex: 'c',
            valueType: 'text',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '此项是必填项',
                },
              ],
            },

            render(a, b, c, d, e, f, g) {
              console.log(a, b, c, d, e, f, g)
              return (
                <Form.List name={[c, 'cs']}>
                  {f =>
                    f.map(({ name }) => (
                      <ProFormText
                        key={name}
                        name={[name, 'c']}
                        rules={[
                          {
                            required: true,
                            message: '此项是必填项',
                          },
                        ]}
                      ></ProFormText>
                    ))
                  }
                </Form.List>
              )
              return <>6</>
            },
          },
          {
            title: '',
            dataIndex: 'as',
            formListProps: {
              creatorRecord: { a: '', ss: [{ s: '' }] },
              min: 1,
              max: 3,
            },

            children: [
              {
                title: '区域名称',
                dataIndex: 'a',
                valueType: 'text',
              },
              {
                title: '街道',
                dataIndex: 'ss',
                formListProps: {
                  creatorRecord: { s: '' },
                  min: 1,
                },

                children: [
                  {
                    title: '街道名称',
                    dataIndex: 's',
                    valueType: 'text',
                    // formItemProps: {
                    //   rules: [
                    //     {
                    //       required: true,
                    //       message: '此项是必填项',
                    //     },
                    //   ],
                    // },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: '',
        dataIndex: 'bcs',
        formListProps: {
          creatorRecord: { bc: '' },
        },
        children: [
          {
            title: '省份别称',
            dataIndex: 'bc',
            valueType: 'text',
          },
        ],
      },
      // {
      //   title: 't',
      //   renderFormItem({ index }) {
      //     return (
      //       <ProFormList name={['list', index, 'cs']}>
      //         {({ name }) => {
      //           return (
      //             <ProFormList name={'as'}>
      //               <ProFormText></ProFormText>
      //             </ProFormList>
      //           )

      //           renderFormItems.length ? (
      //             renderFormItem({ ...item, index: name, __parentFormLists: renderFormItems }, false)
      //           ) : (
      //             <InlineErrorFormItem
      //               errorType="popover"
      //               {...item.formItemProps}
      //               name={compositeName(name, item.dataIndex)}
      //             >
      //               <Field mode="edit" {...(otherItems as any)}></Field>
      //             </InlineErrorFormItem>
      //           )
      //         }}
      //       </ProFormList>
      //     )
      //   },
      // },
    ]

    return data
  }, [])
  return (
    <ProForm preserve={false} form={form} onFinish={a => console.log(a)}>
      {/* <Form.Item name="p" hidden></Form.Item>
      <Form.Item name="c" hidden></Form.Item>
      <Form.Item name="a" hidden></Form.Item>
      <ProFormList min={1} max={4} name={['list', 0, 'cs']} label="用户信息">
        <ProFormText name="c" />
      </ProFormList> */}
      <Form.List name="list">
        {(fields, { add, remove }) => {
          // const dataSource = form.getFieldValue(name)
          console.log(fields, dataSource)
          return (
            <>
              <ProTable
                rowKey="__index"
                ghost
                defaultSize="small"
                search={false}
                bordered={true}
                pagination={false}
                options={false}
                dataSource={dataSource}
                columns={columns}
                // editable={{
                //   editableKeys: (realDataSource || []).map(({ __index }) => __index),
                // }}
              />
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add sights
                </Button>
              </Form.Item>
            </>
          )
        }}
      </Form.List>
      {/* <Form.Item name="test" initialValue={[]}>
        <div></div>
      </Form.Item> */}
      {/* <Form.Item name={}></Form.Item> */}
      <Button
        onClick={async () => {
          console.log(await form.validateFields())
        }}
      >
        T
      </Button>

      <Button htmlType="submit">提交</Button>
    </ProForm>
  )
}

export default FormTableT
