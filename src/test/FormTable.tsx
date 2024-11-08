import ProForm, { ProFormList, ProFormListProps } from '@ant-design/pro-form'
import { EditableProTable, EditableProTableProps, ProColumns } from '@ant-design/pro-table'
import { Button, Form, FormInstance } from 'antd'
import { NamePath } from 'antd/lib/form/interface'
import React, { useEffect, useMemo } from 'react'
import Field from '@ant-design/pro-field'
import { InlineErrorFormItem } from '@ant-design/pro-utils'
import styled from 'styled-components'

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
`
type StringRecord = Record<string, any>

export type FormTableColumn<T = any> = Omit<ProColumns<T>, 'children'> & {
  formListProps?: Omit<ProFormListProps<any>, 'name'>
  children?: FormTableColumn<T>[]
  __parentFormLists?: FormTableColumn<T>[]
}
export type FormTableProps<DataType extends StringRecord = StringRecord> = Omit<
  EditableProTableProps<DataType, never>,
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
  rowKey: string
  initialValue?: Partial<DataType>[]
  form?: FormInstance<any>
  columns: FormTableColumn<DataType>[]
}
const compositeName = (...namePaths: NamePath[]): NamePath =>
  namePaths.map(namePath => (Array.isArray(namePath) ? namePath : [namePath])).flat()

function getHeight(columns: FormTableColumn[], dataObj: any) {
  return (
    Math.max.apply(
      Math,
      (columns ?? []).map(({ dataIndex, children, formListProps }) => {
        const data = dataObj[dataIndex]
        if (Array.isArray(data)) {
          /** 判断是不是到最大限制了 */
          let hasAddBtn = data.length >= (formListProps?.max ?? Infinity) ? 0 : 1
          /** 不可以“增加一列” */
          if (!formListProps?.creatorRecord) hasAddBtn = 0

          const total = data.reduce((n, item) => n + getHeight(children ?? [], item), 0) + hasAddBtn
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
function FormTable<DataType extends StringRecord = StringRecord>(props: FormTableProps<DataType>): JSX.Element {
  const { name, initialValue, prefixCls, form, columns, ...otherProps } = props
  const curForm = ProForm.useFormInstance()
  const formInstance = form || curForm
  const realColumns = useMemo(() => {
    const realColumns = deepCopy(columns)
    const renderFormItem: FormTableColumn<DataType>['renderFormItem'] = function (schema: any, config) {
      const { __parentFormLists, index, renderFormItem, ...othersColumn } = schema
      const [parentFormList, ...otherParentFormLists] = __parentFormLists || []
      if (!parentFormList) return <></>
      const listNamePath = config ? compositeName(name, index, parentFormList.dataIndex) : parentFormList.dataIndex
      /** children里面的第一个column，才会显示增删的操作按钮 */
      const isShowAction = !(parentFormList?.children?.[0]?.key !== schema.key)

      const { formListProps } = parentFormList

      const creatorButtonProps =
        formListProps.creatorRecord === undefined
          ? false
          : isShowAction
          ? formListProps?.creatorButtonProps ?? {
              type: 'link',
              size: 'small',
              style: { textAlign: 'left', justifyContent: 'flex-start', padding: 0 },
            }
          : false
      return (
        <ProFormList
          {...formListProps}
          name={listNamePath}
          className="ProFormList"
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
          {({ name }) => {
            const entity = schema.entity?.[parentFormList.dataIndex]?.[name]
            const minHeight = getHeight(parentFormList.children, entity) * 40 + 'px'
            return (
              <div className="ProFormListItem" style={{ minHeight }}>
                {otherParentFormLists.length ? (
                  renderFormItem({ ...schema, entity, index: name, __parentFormLists: otherParentFormLists }, false)
                ) : (
                  <InlineErrorFormItem
                    className="ProFormItem"
                    errorType="popover"
                    {...schema.formItemProps}
                    name={compositeName(name, schema.dataIndex)}
                  >
                    <Field mode="edit" {...(othersColumn as any)}></Field>
                  </InlineErrorFormItem>
                )}
              </div>
            )
          }}
        </ProFormList>
      )
    }
    /** 给每个column加上renderFormItem和__parentFormLists */
    const dfs = (column: FormTableColumn<DataType>) => {
      column.key = compositeName(
        (column.__parentFormLists || []).map(({ dataIndex }) => dataIndex),
        column.dataIndex
      ).join('.')

      if (!column.formListProps || !Array.isArray(column.children) || column.children.length === 0) return
      column.children.forEach((item, index) => {
        item.renderFormItem = renderFormItem
        item.__parentFormLists = [...(column.__parentFormLists || []), column]
        dfs(item)
      })
    }
    realColumns.forEach(dfs)
    return realColumns
  }, [columns, name])

  const dataSource: DataType[] = Form.useWatch(name, formInstance)
  return (
    <Styled>
      <EditableProTable
        ghost
        defaultSize="small"
        pagination={false}
        columns={realColumns}
        bordered
        name={name}
        editable={{
          type: 'multiple',
          editableKeys: dataSource?.map((_, i) => i) ?? [],
        }}
        // recordCreatorProps={{
        //   record(__index, dataSource) {
        //     return { __index }
        //   },
        // }}
        {...otherProps}
      />
    </Styled>
  )
  // return (
  //   <ProFormDependency name={[name]}>
  //     {(obj, form) => {
  //       const realDataSource = form.getFieldValue(name)?.map((obj, __index) => ({ __index, ...obj })) ?? []

  //       console.log('realDataSource', realDataSource)
  //       return (
  //         <ProTable
  //           rowKey="__index"
  //           ghost
  //           defaultSize="small"
  //           search={false}
  //           bordered={true}
  //           pagination={false}
  //           options={false}
  //           dataSource={realDataSource}
  //           columns={realColumns}
  //           name={name}
  //           editable={{
  //             editableKeys: (realDataSource || []).map(({ __index }) => __index),
  //           }}
  //           {...otherProps}
  //         />
  //       )
  //     }}
  //   </ProFormDependency>
  // )
  // return (
  //   <Styled>
  //     <Form.List name={name} initialValue={initialValue} rules={rules} prefixCls={prefixCls}>
  //       {(fields, { add, remove }) => {
  //         // const dataSource = form.getFieldValue(name)
  //         console.log(fields, dataSource)
  //         return (
  //           <>
  //             <ProTable
  //               rowKey="__index"
  //               ghost
  //               defaultSize="small"
  //               search={false}
  //               bordered={true}
  //               pagination={false}
  //               options={false}
  //               dataSource={realDataSource}
  //               columns={realColumns}
  //               name={name}
  //               // editable={{
  //               //   editableKeys: (realDataSource || []).map(({ __index }) => __index),
  //               // }}
  //               {...otherProps}
  //             />
  //             <Form.Item>
  //               <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
  //                 Add sights
  //               </Button>
  //             </Form.Item>
  //           </>
  //         )
  //       }}
  //     </Form.List>
  //   </Styled>
  // )
}

type FormData = any
const App: React.FC = () => {
  const [form] = ProForm.useForm<FormData>()

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
              { a: '福田', ss: [] },
            ],
          },
        ],
      },
      { __index: 1, p: 'gx', cs: [{ c: '桂林', as: [{ a: '叠彩' }] }] },
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
          creatorRecord: { c: '', as: [{ a: '' }] },
          min: 1,
        },
        children: [
          {
            title: '城市名称',
            dataIndex: 'c',
            valueType: 'text',
          },
          {
            title: '',
            dataIndex: 'as',
            formListProps: {
              creatorRecord: { a: '' },
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
      <FormTable columns={columns} name="list" rowKey="__index" />
      {/* <Form.Item name="test" initialValue={[]}>
        <div></div>
      </Form.Item> */}
      {/* <Form.Item name={}></Form.Item> */}

      <Button htmlType="submit">提交</Button>
    </ProForm>
  )
}

export default App
