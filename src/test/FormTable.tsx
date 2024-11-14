import ProForm, { ProFormList, ProFormListProps, ProFormText } from '@ant-design/pro-form'
import ProTable, { ProColumns, ProTableProps } from '@ant-design/pro-table'
import { Button, Empty, Form, FormInstance, FormListOperation, Input, Space } from 'antd'
import React, { FC, useEffect, useMemo } from 'react'
import Field, { ProFieldPropsType } from '@ant-design/pro-field'
import { InlineErrorFormItem, ProFieldValueType } from '@ant-design/pro-utils'
import styled from 'styled-components'
import { FormListProps } from 'antd/lib/form'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'

const Styled = styled.div`
  > .ant-pro-table > .ant-pro-card {
    box-shadow: none;
  }
  td.ant-table-cell {
    vertical-align: top;
  }
  .ant-table-cell:empty {
    padding: 0 !important;
    border: none !important;
  }
  .ant-table.ant-table-small .ant-table-thead > tr > th {
    padding: 16px 8px;
    vertical-align: middle;
  }
  tr {
    height: 0;
    line-height: 0;
  }
  .ant-table.ant-table-small .ant-table-tbody > tr > td:has(.ProFormItem) {
    padding-top: 0;
    padding-bottom: 0;
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
  .ant-pro-form-list > div {
    width: 100% !important;
  }
  .ProFormItem input[type='text'] {
    min-width: 100px;
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

  .ProFormListItem:has(.ant-upload) .ant-form-item-control-input-content > span {
    display: flex;
    .ant-upload-list-item {
      margin: 0;
    }
    .ant-upload-list {
      padding-left: 10px;
      .ant-upload-list-item-name {
        max-width: 160px;
      }
    }
  }

  /* .ProFormListItem:last-of-type {
  min-height: 40px !important;
} */
`
type StringRecord = Record<string, any>
type NamePath = string | number | Array<string | number>

export type FormTableProColumn<T = any> = Omit<ProColumns<T>, 'children' | 'dataIndex' | 'valueType'> & {
  formListProps?: Omit<ProFormListProps<any>, 'children' | 'name' | 'min' | 'max'> & {
    max?: number
    min?: number
  }
  children?: FormTableProColumn<T>[]
  __parentFormLists?: string[]
  dataIndex: string
  mode?: ProFieldPropsType['mode']
  formListFieldRender?(dom: React.ReactNode, entity: any, column: FormTableProColumn<T>): React.ReactNode
  valueType?: ProFieldValueType | 'operation' | 'none'
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
  onAdd?: (namePath: NamePath, data: any, index: number, formInstance: FormInstance<any>) => Promise<any[]> | void
  onRemove?: (namePath: NamePath, data: any, index: number, formInstance: FormInstance<any>) => Promise<boolean> | void
} & Omit<FormListProps, 'children' | 'name'>

const compositeName = (...namePaths: NamePath[]): Array<string | number> =>
  namePaths.map(namePath => (Array.isArray(namePath) ? namePath : [namePath])).flat()

function getHeight(columns: FormTableProColumn[] | undefined, dataObj: any) {
  return (
    Math.max.apply(
      Math,
      (columns ?? []).map(({ dataIndex, children, formListProps }) => {
        const data = dataObj?.[dataIndex]
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

function InlineErrorField<DataType extends StringRecord = StringRecord>(props: {
  column: FormTableProColumn<DataType>
  index: number
  entity: any
  form: FormInstance
}) {
  const { index, column, entity, form } = props
  const { render, renderFormItem, formListFieldRender: formListItemRender, formItemProps, ...otherColumn } = column
  const name = compositeName(index, String(column.dataIndex))
  const dom: React.ReactNode = <Field mode="edit" {...(otherColumn as any)} />
  return (
    <InlineErrorFormItem
      className="ProFormItem"
      errorType="popover"
      {...(typeof formItemProps === 'function' ? formItemProps(form, { entity, ...column } as any) : formItemProps)}
      name={name}
    >
      {formListItemRender?.(dom, entity, otherColumn) ?? dom}
    </InlineErrorFormItem>
  )
}

function FormTablePro<DataType extends StringRecord = StringRecord>(
  props: FormTableProProps<DataType>
): React.ReactNode {
  const { name, initialValue, prefixCls, form, rules, columns, onAdd, onRemove, ...otherProps } = props
  const curForm = Form.useFormInstance()
  const formInstance = form || curForm
  const realColumns = useMemo(() => {
    const realColumns = deepCopy(columns)
    const columnMap = new Map<string, FormTableProColumn<DataType>>()
    const render: Required<ProColumns<DataType>>['render'] = function (dom, entity, index, action, schema) {
      const { __parentFormLists, ...othersColumn } = schema as FormTableProColumn<DataType>
      const [parentFormListKey, ...otherParentFormLists] = __parentFormLists || []
      if (!parentFormListKey) return <></>
      const parentFormList = columnMap.get(parentFormListKey)!
      const curEntity = entity?.[parentFormList.dataIndex]
      const listNamePath = dom ? compositeName(index, parentFormList.dataIndex) : parentFormList.dataIndex
      /** children里面的第一个column，才会显示增删的操作按钮 */
      const isShowAction = !(parentFormList?.children?.[0]?.key !== othersColumn.key)

      const { formListProps } = parentFormList
      const creatorButtonProps: any =
        formListProps?.creatorRecord === undefined
          ? false
          : isShowAction
          ? {
              type: 'link',
              size: 'small',
              style: { textAlign: 'left', justifyContent: 'flex-start', padding: 0 },
              creatorButtonText: '添加' + ' ' + (othersColumn.title ?? ''),
              ...(formListProps?.creatorButtonProps || {}),
            }
          : false
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
                      ...othersColumn,
                      __parentFormLists: otherParentFormLists,
                    } as any)}
                  </>
                ) : (
                  <InlineErrorField column={othersColumn} index={index} entity={curValue} form={formInstance} />
                )}
              </div>
            )
          }}
        </ProFormList>
      )
    }
    /** 给每个column加上renderFormItem和__parentFormLists */
    const dfs = (column: FormTableProColumn<DataType>) => {
      /** 拦截特殊valueType */
      if (column.valueType === 'operation') {
        column.render = (_, entity, index) => (
          <Operation name={name} index={index} formInstance={formInstance} onAdd={onAdd} onRemove={onRemove} />
        )
        return
      }
      if (column.valueType === 'index' || column.valueType === 'none') {
        if (column.valueType === 'none') delete column.valueType
        return
      }
      column.key = compositeName(column.__parentFormLists || [], column.dataIndex).join('.')
      columnMap.set(column.key, column)

      /** 限制输入组件只能32px */
      column.fieldProps = {
        ...column.fieldProps,
        style: { height: '32px', ...((column.fieldProps as any)?.style ?? {}) },
      }

      if (!column.formListProps || !Array.isArray(column.children) || column.children.length === 0) {
        if (!column.render)
          column.render = (dom, entity, index) => (
            <InlineErrorField column={column} index={index} entity={entity} form={formInstance} />
          )

        return
      }

      column.children.forEach(item => {
        if (item.render) {
          if (!Reflect.has(item, '__render') && item.render !== render) {
            Reflect.set(item, '__render', item.render)
            item.render = (dom, entity, index, action, schema) => {
              return (
                <div style={{ height: '40px' }}>
                  {Reflect.get(item, '__render')?.(dom, entity, index, action, schema) as any}
                </div>
              )
            }
          }
        } else {
          item.render = render
        }

        item.__parentFormLists = [...(column.__parentFormLists || []), String(column.key)]
        dfs(item)
      })
    }
    realColumns.forEach(dfs)
    return realColumns
  }, [columns, formInstance, name, onAdd, onRemove])

  const dataSource: DataType[] = Form.useWatch(name, formInstance)
  const realDataSource = useMemo(() => dataSource?.map((obj, __index) => ({ ...obj, __index })), [dataSource])
  return (
    <Styled>
      <Form.List name={name} initialValue={initialValue} rules={rules} prefixCls={prefixCls}>
        {() => {
          // const dataSource = form.getFieldValue(name)
          // console.log(fields, dataSource)
          return (
            <ProTable
              ghost
              defaultSize="small"
              search={false}
              bordered={true}
              pagination={false}
              options={false}
              dataSource={realDataSource}
              columns={realColumns as any}
              {...otherProps}
              rowKey="__index"
              locale={{
                ...otherProps.locale,
                emptyText:
                  otherProps.locale?.emptyText ??
                  (onAdd ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null}>
                      <Button
                        type="primary"
                        size="small"
                        ghost
                        onClick={async () => {
                          const res = await onAdd(name, dataSource, dataSource?.length ?? 0, formInstance)
                          if (Array.isArray(res)) {
                            const fieldValue = formInstance.getFieldValue(name)
                            const newData = Array.isArray(fieldValue) ? fieldValue : []
                            newData.splice((dataSource?.length ?? 0) + 1, 0, ...res)
                            formInstance.setFieldValue(name, [...newData])
                          }
                        }}
                      >
                        添加
                      </Button>
                    </Empty>
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )),
              }}
            />
          )
        }}
      </Form.List>
    </Styled>
  )
}

const Operation: FC<
  Pick<FormTableProProps, 'onAdd' | 'onRemove' | 'name'> & {
    index: number
    formInstance: FormInstance
  }
> = props => {
  const { onAdd, onRemove, name, index, formInstance } = props
  const operationButtonCommonStyle = {
    fontSize: 20,
    opacity: 1,
    cursor: 'pointer',
  }
  return (
    <Space style={{ margin: '10px 0' }}>
      {onAdd && (
        <PlusCircleOutlined
          style={{
            color: '#1255f1',
            ...operationButtonCommonStyle,
          }}
          onClick={async () => {
            const res = await onAdd(name, formInstance.getFieldValue(name), index, formInstance)
            if (Array.isArray(res)) {
              const newData = formInstance.getFieldValue(name) || []
              if (Array.isArray(newData)) {
                newData.splice(index + 1, 0, ...res)
                formInstance.setFieldValue(name, [...newData])
              }
            }
          }}
        />
      )}
      {onRemove && (
        <MinusCircleOutlined
          style={{
            color: '#F63F5A',
            ...operationButtonCommonStyle,
          }}
          onClick={async () => {
            const res = await onRemove(name, formInstance.getFieldValue(name), index, formInstance)
            if (res === true) {
              const newData = formInstance.getFieldValue(name) || []
              if (Array.isArray(newData)) {
                newData.splice(index, 1)
                formInstance.setFieldValue(name, [...newData])
              }
            }
          }}
        />
      )}
    </Space>
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
        dataIndex: '__index',
        valueType: 'index',
        title: 'No.',
        fixed: 'left',
      },
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
            // formItemProps: {
            //   rules: [
            //     {
            //       required: true,
            //       message: '此项是必填项',
            //     },
            //   ],
            // },
            formItemProps(...a) {
              console.log(...a)
              return {
                rules: [
                  {
                    required: true,
                    message: '此项是必填项',
                  },
                ],
              }
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
                    formListFieldRender(dom, entity, column) {
                      console.log(entity, column)
                      return <Input />
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
      { title: '操作', dataIndex: '', valueType: 'operation' },
    ]

    return data
  }, [])
  return (
    <ProForm form={form} onFinish={async a => console.log(a)} submitter={false} scrollToFirstError>
      <FormTablePro
        columns={columns}
        name="list"
        onAdd={async (...a) => {
          console.log(...a)
          return [{}]
        }}
        onRemove={async () => true}
      />

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
