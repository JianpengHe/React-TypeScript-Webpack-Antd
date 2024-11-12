import ProForm, { ProFormList, ProFormListProps } from '@ant-design/pro-form'
import ProTable, { ProColumns, ProTableProps } from '@ant-design/pro-table'
import { Button, Form, FormInstance } from 'antd'
import React, { useEffect, useMemo } from 'react'
import Field from '@ant-design/pro-field'
import { InlineErrorFormItem } from '@ant-design/pro-utils'
import styled from 'styled-components'
import { PlusOutlined } from '@ant-design/icons'
import { FormListProps } from 'antd/lib/form'

const Styled = styled.div`
  td.ant-table-cell {
    vertical-align: top;
  }
  .ant-table-cell:empty {
    padding: 0 !important;
    border: none !important;
  }
  .ant-form-item {
    margin: 0;
  }
  .ant-form-item .list-item {
    display: flex;
    align-items: flex-start;
    min-height: 40px;
  }
  .ant-form-item .list-item .ant-pro-form-list-action {
    margin: 13px 0;
    height: 14px;
  }

  .ant-form-item .list-item .ant-spin-container > .anticon,
  .ant-form-item .list-item .ant-pro-form-list-action > .anticon {
    margin-left: 0;
    margin-right: 8px;
    display: flex;
    align-items: center;
    height: 14px;
  }
  .ant-form-item .ant-form-item-control-input-content > div > button {
    height: 32px;
    margin: 0 0 8px 0;
  }
  .ant-form-item {
    margin: 0;
    margin-block: 0 !important;
  }
  .ant-form-item .ant-pro-form-list-container {
    width: 100%;
  }
  .ProFormItem {
    padding: 4px 0;
  }
  /* .ProFormListItem:last-of-type {
    min-height: 40px !important;
  } */
`
type StringRecord = Record<string, any>
type NamePath = string | number | Array<string | number>

export type FormTableProColumn<T = any> = Omit<ProColumns<T>, 'children' | 'dataIndex'> & {
  formListProps?: Omit<ProFormListProps<any>, 'children' | 'name' | 'min' | 'max'> & { max?: number; min?: number }
  children?: FormTableProColumn<T>[]
  __parentFormLists?: FormTableProColumn<T>[]
  dataIndex: string
}
export type FormTableProProps<DataType extends StringRecord = StringRecord> = Omit<
  ProTableProps<DataType, never>,
  | 'request'
  | 'params'
  | 'postData'
  | 'defaultData'
  | 'dataSource'
  | 'onDataSourceChange'
  | 'actionRef'
  | 'formRef'
  | 'toolBarRender'
  | 'onRequestError'
  | 'options'
  | 'search'
  | 'beforeSearchSubmit'
  | 'form'
  | 'onSubmit'
  | 'onReset'
  | 'toolbar'
  | 'manualRequest'
  | 'editable'
  | 'debounceTime'
  | 'revalidateOnFocus'
  | 'name'
  | 'rowKey'
  | 'columns'
> & {
  name: NamePath
  form?: FormInstance<any>
  columns: FormTableProColumn<DataType>[]
} & Omit<FormListProps, 'children' | 'name'>
const compositeName = (...namePaths: NamePath[]): Array<string | number> =>
  namePaths.map(namePath => (Array.isArray(namePath) ? namePath : [namePath])).flat()

function getHeight(columns: FormTableProColumn[] | undefined, dataObj: any) {
  return (
    Math.max.apply(
      Math,
      (columns ?? []).map(({ dataIndex, children, formListProps }) => {
        const data = dataObj[dataIndex]
        if (formListProps && Array.isArray(data)) {
          /** 判断是不是到最大限制了 */
          let hasAddBtn = data.length >= (formListProps?.max ?? Infinity) ? 0 : 1
          /** 不可以“增加一列” */
          if (!formListProps?.creatorRecord) hasAddBtn = 0

          const total: number = data.reduce((n, item) => n + getHeight(children, item), 0) + hasAddBtn
          return total
        }
        return 1
      })
    ) || 0
  )
}
function deepCopy<T>(columns: T): T {
  if (!columns || typeof columns !== 'object') return columns
  if (Array.isArray(columns)) {
    return columns.map(deepCopy) as any
  }
  const newColumns: any = {}
  for (const k in columns) {
    newColumns[k] = deepCopy(columns[k])
  }
  return newColumns
}
function FormTablePro<DataType extends StringRecord = StringRecord>(props: FormTableProProps<DataType>): JSX.Element {
  const { name, initialValue, prefixCls, form, rules, columns, ...otherProps } = props
  const curForm = ProForm.useFormInstance()
  const formInstance = form || curForm
  const realColumns = useMemo(() => {
    const realColumns = deepCopy(columns)
    const render: Required<ProColumns<DataType>>['render'] = function (dom, entity, index, action, schema) {
      const { __parentFormLists, ...othersColumn } = schema as FormTableProColumn<DataType>
      const [parentFormList, ...otherParentFormLists] = __parentFormLists || []
      if (!parentFormList) return <></>

      const curEntity = entity?.[parentFormList.dataIndex]
      const listNamePath = dom ? compositeName(index, parentFormList.dataIndex) : parentFormList.dataIndex
      /** children里面的第一个column，才会显示增删的操作按钮 */
      const isShowAction = !(parentFormList?.children?.[0]?.key !== schema.key)

      const { formListProps } = parentFormList
      const creatorButtonProps =
        formListProps?.creatorRecord === undefined
          ? false
          : isShowAction
          ? formListProps?.creatorButtonProps ?? {
              type: 'link',
              size: 'small',
              style: { textAlign: 'left', justifyContent: 'flex-start', padding: 0 },
            }
          : false
      // console.log(schema, listNamePath)
      return (
        <ProFormList
          {...formListProps}
          name={listNamePath}
          deleteIconProps={isShowAction ? formListProps?.deleteIconProps : false}
          /** 默认不展示复制按钮 */
          copyIconProps={isShowAction ? formListProps?.copyIconProps ?? false : false}
          creatorButtonProps={creatorButtonProps}
          itemRender={dom => (
            <div className="list-item">
              {dom.action}
              {dom.listDom}
            </div>
          )}
        >
          {(_, index) => {
            const curValue = curEntity?.[index]
            const minHeight = getHeight(parentFormList.children, curValue) * 40 + 'px'

            return (
              <div key={index} className="ProFormListItem" style={{ minHeight }}>
                {otherParentFormLists.length ? (
                  <>
                    {render(null, curValue, index, action, {
                      ...schema,
                      __parentFormLists: otherParentFormLists,
                    } as any)}
                  </>
                ) : (
                  <InlineErrorFormItem
                    className="ProFormItem"
                    errorType="popover"
                    {...schema.formItemProps}
                    name={compositeName(index, String(schema.dataIndex))}
                  >
                    <Field mode="edit" {...(othersColumn as any)} />
                  </InlineErrorFormItem>
                )}
              </div>
            )
          }}
        </ProFormList>
      )
    }
    /** 给每个column加上renderFormItem和__parentFormLists */
    const dfs = (column: FormTableProColumn<DataType>) => {
      column.key = compositeName(
        (column.__parentFormLists || []).map(({ dataIndex }) => dataIndex),
        column.dataIndex
      ).join('.')

      if (!column.formListProps || !Array.isArray(column.children) || column.children.length === 0) return
      column.children.forEach((item: any, index) => {
        item.render = render
        item.__parentFormLists = [...(column.__parentFormLists || []), column]
        dfs(item)
      })
    }
    realColumns.forEach(dfs)
    return realColumns
  }, [columns])

  const dataSource: DataType[] = Form.useWatch(name, formInstance)
  const realDataSource = useMemo(() => dataSource?.map((obj, __index) => ({ ...obj, __index })), [dataSource])
  return (
    <Styled>
      <Form.List name={name} initialValue={initialValue} rules={rules} prefixCls={prefixCls}>
        {(fields, { add, remove }) => {
          // const dataSource = form.getFieldValue(name)
          // console.log(fields, dataSource)
          return (
            <>
              <ProTable
                ghost
                defaultSize="small"
                search={false}
                bordered={true}
                pagination={false}
                options={false}
                dataSource={realDataSource}
                columns={realColumns}
                {...otherProps}
                rowKey="__index"
              />

              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add sights
              </Button>
            </>
          )
        }}
      </Form.List>
    </Styled>
  )
}

type FormData = {
  list: {
    p: string
    cs?: {
      c: string
      as?: {
        a: string
        ss?: {
          s: string
        }[]
      }[]
    }[]
  }[]
}
const App: React.FC = () => {
  const [form] = ProForm.useForm<FormData>()

  useEffect(() => {
    if (!form) return
    console.log('set')
    form.setFieldValue('list', [
      {
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
      { p: 'gx', cs: [{ c: '桂林', as: [{ a: '叠彩', ss: [] }] }] },
    ])
  }, [form])
  const columns = useMemo(() => {
    const data: FormTableProColumn<FormData['list'][0]>[] = [
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
                    formItemProps: {
                      rules: [
                        {
                          required: true,
                          message: '此项是必填项',
                        },
                      ],
                    },
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
    ]

    return data
  }, [])
  return (
    <ProForm form={form} onFinish={async a => console.log(a)} submitter={false} scrollToFirstError>
      <FormTablePro columns={columns} name="list" />

      <Button
        onClick={async () => {
          console.log(await form.validateFields())
        }}
      >
        验证
      </Button>

      <Button htmlType="submit">提交</Button>
    </ProForm>
  )
}

export default App
