import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { ProFormText } from '@ant-design/pro-form'
import { Table, Button, Form, Input, Select, Space, TableProps, FormInstance, Empty, FormListOperation } from 'antd'
import { NamePath } from 'antd/es/form/interface'
import { ColumnType } from 'antd/es/table'
import React, { memo, useEffect, useMemo, useState } from 'react'

const App1: React.FC = () => {
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    console.log('Received values of form:', values)
  }
  useEffect(() => {
    form.setFieldValue('sights', [{ price: 100 }, { price: 200 }])
  }, [form])

  return (
    <Form form={form} name="dynamic_form_complex" onFinish={onFinish} autoComplete="off">
      <Form.List name="sights">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, i) => {
              console.log(fields)
              return i % 2 === 0 ? null : (
                <Space key={field.key} align="baseline">
                  <Form.Item {...field} label="Price" name={[field.name, 'price']}>
                    <Input />
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              )
            })}
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}
export type FormTableProps<RecordType extends Record<string, any>, RowKey extends keyof RecordType> = {
  namePath: NamePath
  formInstance: FormInstance
  rowKey: RowKey
  columns: (Omit<ColumnType<RecordType>, 'render' | 'dataIndex'> & {
    dataIndex: keyof RecordType
    render?: (
      value: RecordType[keyof RecordType],
      record: RecordType,
      index: number,
      namePath: NamePath,
      operation: { add: (newItem?: RecordType) => RecordType[]; remove: (index: number) => RecordType[] }
    ) => React.ReactNode
  })[]
  initialValue?: Partial<RecordType>[]
  itemInitialValue?: Partial<RecordType>
  hideEmptyAddButton?: boolean
  emptyText?: React.ReactNode
} & Omit<TableProps<RecordType>, 'rowKey' | 'columns' | 'dataSource'>
const compositeName = (...namePaths: NamePath[]): NamePath =>
  namePaths.map(namePath => (Array.isArray(namePath) ? namePath : [namePath])).flat()

function withFormTable<RowKey extends keyof RecordType, RecordType extends Record<string, any>>(
  Element: React.ComponentType<TableProps<RecordType>>
) {
  function NewElement(props: FormTableProps<RecordType, RowKey>) {
    const {
      namePath,
      formInstance,
      rowKey,
      initialValue,
      itemInitialValue,
      hideEmptyAddButton,
      emptyText,
      columns,
      ...otherProps
    } = props
    // const formInstance = Form.useFormInstance()
    const dataSource = Form.useWatch(namePath, formInstance) || []
    // console.log(dataSource)
    const operation = useMemo(
      () => ({
        add(value?: Partial<RecordType>) {
          const oldArr = formInstance.getFieldValue(namePath) || []
          const newArr: RecordType[] = [...oldArr, value || initialValue || {}]
          formInstance.setFieldValue(namePath, newArr)
          return newArr
        },
        remove(index: number) {
          const oldArr = formInstance.getFieldValue(namePath) || []
          const newArr: RecordType[] = [...oldArr]
          newArr.splice(index, 1)
          formInstance.setFieldValue(namePath, newArr)
          return newArr
        },
      }),
      [formInstance, initialValue, namePath]
    )
    const newColumns: any = useMemo(
      () =>
        columns.map(({ dataIndex, render, ...others }) => ({
          dataIndex,
          render: render
            ? (value: RecordType[keyof RecordType], record: RecordType, index: number) =>
                render(value, record, index, compositeName(namePath, index, dataIndex), operation)
            : undefined,
          ...others,
        })),
      [columns, namePath, operation]
    )
    const locale = useMemo(
      () => ({
        emptyText:
          emptyText ??
          (hideEmptyAddButton ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null}>
              <Button
                type="primary"
                size="small"
                ghost
                onClick={() => operation.add({ [rowKey]: Math.random(), ...(itemInitialValue || {}) })}
              >
                {t('common.add')}
              </Button>
            </Empty>
          )),
      }),
      [emptyText, hideEmptyAddButton, itemInitialValue, operation, rowKey]
    )
    return (
      <>
        {/* <Form.List name={namePath} initialValue={initialValue || []}>
          {() =>
            newColumns.map(a => (
              <Form.Item key={Math.random()} name={[0, a.dataIndex]}>
                <Input></Input>
              </Form.Item>
            ))
          }
        </Form.List> */}
        {/* <Form.Item name={namePath} initialValue={[]} hidden>
          <></>
        </Form.Item> */}
        <Form.List name={namePath}>{() => null}</Form.List>
        <Element
          bordered
          size="small"
          pagination={false}
          rowKey={rowKey}
          dataSource={dataSource}
          columns={newColumns}
          locale={locale}
          {...otherProps}
        />
      </>
    )
    return (
      <Form.List name={namePath} initialValue={initialValue}>
        {(fields, operation) => {
          //   console.log(namePath, formInstance.getFieldsValue(), dataSource)
          console.log('Form.List render')
          return (
            // @ts-ignore
            <Element
              bordered
              size="small"
              pagination={false}
              rowKey={rowKey}
              dataSource={dataSource}
              // @ts-ignore
              columns={columns.map(({ dataIndex, render, ...others }) => ({
                dataIndex,
                render: render
                  ? (value: RecordType[keyof RecordType], record: RecordType, index: number) =>
                      render(value, record, index, compositeName(index, dataIndex), operation)
                  : undefined,
                ...others,
              }))}
              locale={{
                emptyText:
                  emptyText ??
                  (hideEmptyAddButton ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null}>
                      <Button type="primary" size="small" ghost onClick={() => operation.add(itemInitialValue)}>
                        {t('common.add')}
                      </Button>
                    </Empty>
                  )),
              }}
              {...otherProps}
            />
          )
        }}
      </Form.List>
    )
  }
  return memo(NewElement)
}

type FormData = { test: { k: string; a: string; b: number } }
const FormTable = withFormTable(Table<FormData['test']>)

const App: React.FC = () => {
  const [form] = Form.useForm<FormData>()
  useEffect(() => {
    const arr = [
      { k: '1', a: '3', b: 100 },
      { k: '2', a: '5', b: 200 },
    ]
    arr.forEach((a, i) => Object.entries(a).forEach(([k, v]) => form.setFieldValue(['test', i, k], v)))
  }, [])
  const columns = useMemo<FormTableProps<FormData['test'], 'a'>['columns']>(
    () => [
      {
        title: 'A',
        dataIndex: 'a',
        render(value, record, index, name, { add, remove }) {
          return (
            <>
              <ProFormText name={name}></ProFormText>
              <Button onClick={() => console.log(add({ a: String(Math.random()), b: 6 }))}>ADD</Button>
              <Button onClick={() => console.log(remove(index))}>REMOVE</Button>
              {value}
            </>
          )
        },
      },
      {
        title: 'B',
        dataIndex: 'b',
        render(value, record, index, name, { add, remove }) {
          // debugger
          console.log(name)
          // return <Form.Item name={name} hidden></Form.Item>
          return <ProFormText name={name}></ProFormText>
        },
      },
    ],
    []
  )
  console.log('发到')
  return (
    <Form preserve={false} form={form} onFinish={a => console.log(a)}>
      <FormTable namePath="test" formInstance={form} rowKey="k" columns={columns} />
      {/* <Form.Item name="test" initialValue={[]}>
        <div></div>
      </Form.Item> */}
      {/* <Form.Item name={}></Form.Item> */}
      <Button htmlType="submit">提交</Button>
    </Form>
  )
}

export default App
const t = a => a
// type TestProps<T> = { a: T; b: (a: T) => void }
// function Test<T>(props: TestProps<T>) {
//   return <></>
// }

// function withTest<T>(Element: React.ComponentType<TestProps<T>>) {
//   return (props: TestProps<T>) => <Element {...props} />
// }

// const TestHOC = withTest(Test<string>)

// const APP: React.FC<{}> = () => {
//   return <Test<string> a={'test'} b={a => {}}></Test>
// }
