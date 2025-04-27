import { ProFormSelect } from '@ant-design/pro-form'
import { ProFormPropsType } from '@ant-design/pro-form/es/components/SchemaForm'
import { ProFormFieldItemProps } from '@ant-design/pro-form/es/typing'
import { Button, Form, FormInstance, Select } from 'antd'
import { NamePath } from 'antd/lib/form/interface'
import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import ProTable, { ProColumns, ProTableProps } from '@ant-design/pro-table'
import Field from '@ant-design/pro-form/es/components/Field'

const showLabel = (obj: any) => `【${obj.id}】${obj.name}`

const options = Array(10)
  .fill(0)
  .map((_, i) => {
    const obj = { id: 'id' + i, name: 'name' + i }

    return { label: showLabel(obj), value: showLabel(obj), key: JSON.stringify(obj) }
  })

export const TestForm: FC<{}> = ({}) => {
  const [data, setData] = useState({})
  const [form] = Form.useForm()
  const set = useCallback(() => {
    const newObj = { id: 'id6', name: 'name6' }
    form.setFieldsValue({ ...newObj, info: showLabel(newObj) })
  }, [form])
  console.log('render')
  return (
    <>
      <Form onFinish={setData} form={form}>
        <Form.Item name="info" label="test">
          <Select options={options} labelInValue />
        </Form.Item>
        <SyncFormItemValue dependency="info" needSyncNamePath={['id', 'name']} form={form} />
        <Button htmlType="submit" type="primary">
          提交
        </Button>
        <Button onClick={set}>手动设置</Button>
      </Form>
      <div>结果：</div>
      {JSON.stringify(data)}
    </>
  )
}

export const SyncFormItemValue: FC<{
  dependency: NamePath
  needSyncNamePath: NamePath[]
  form: FormInstance<any>
}> = ({ dependency, needSyncNamePath, form }) => {
  const data = Form.useWatch(dependency, form)
  useEffect(() => {
    console.log(data)
    // form.setFieldsValue()
  }, [data, form])

  return (
    <>
      现在的值{JSON.stringify(data)}
      <br />
      {needSyncNamePath.map((namePath, i) => (
        <Form.Item key={i + String(namePath)} hidden name={namePath}>
          <></>
        </Form.Item>
      ))}
    </>
  )
}

export const TestForm2: FC<{}> = ({}) => {
  const [data, setData] = useState({})
  const [form] = Form.useForm()
  const set = useCallback(() => {
    const newObj = { id: 'id6', name: 'name6' }
    form.setFieldsValue({ ...newObj, info: showLabel(newObj) })
  }, [form])
  console.log('render')
  //   const onChange = value => {
  //     console.log(value)
  //   }
  return (
    <>
      <Form onFinish={setData} form={form}>
        <Form.Item
          name="info"
          label="test"
          normalize={value => {
            if (value.key) {
              try {
                form.setFieldsValue(JSON.parse(value.key))
              } catch (e) {}
            }
            return value
          }}
        >
          <Select options={options} labelInValue />
        </Form.Item>
        <Form.Item hidden name={'id'}>
          <></>
        </Form.Item>
        <Form.Item hidden name={'name'}>
          <></>
        </Form.Item>
        <Button htmlType="submit" type="primary">
          提交
        </Button>
        <Button onClick={set}>手动设置</Button>
      </Form>
      <div>结果：</div>
      {JSON.stringify(data)}
    </>
  )
}

type WithSyncFormItemValueProps = {
  needSyncNamePath: NamePath[]
  onUpdate?: (value: any, form: FormInstance<any>) => void
}
// React.PropsWithChildren<React.JSX.IntrinsicAttributes
function withSyncFormItemValue<P extends ProFormFieldItemProps>(
  Element: React.ComponentType<P>
): React.FC<P & WithSyncFormItemValueProps> {
  return memo(props => {
    const form = Form.useFormInstance()
    const { normalize, needSyncNamePath, onUpdate } = props || {}
    /** 修改normalize */
    const newNormalize = useMemo(() => {
      const newNormalize: typeof normalize = (value, prevValue, allValues) => {
        if (value.key) {
          try {
            onUpdate ? onUpdate(value, form) : form.setFieldsValue(JSON.parse(value.key))
          } catch (e) {}
        }
        return typeof normalize === 'function' ? normalize(value, prevValue, allValues) : value
      }

      return newNormalize
    }, [form, normalize, onUpdate])

    /** 修改fieldProps */
    const fieldProps = props.fieldProps || {}
    fieldProps.labelInValue = true
    console.log('SyncFormItemValue')
    return (
      <>
        <Element {...props} normalize={newNormalize} fieldProps={fieldProps} />
        {needSyncNamePath.map((namePath, i) => (
          <Form.Item key={i + String(namePath)} hidden name={namePath}>
            <></>
          </Form.Item>
        ))}
      </>
    )
  })
}
const ProFormSelectHOC = withSyncFormItemValue(ProFormSelect)
const needSyncNamePath = ['id', 'name']
const fieldProps = { options }
export const TestForm3: FC<{}> = ({}) => {
  const [data, setData] = useState({})
  const [form] = Form.useForm()
  const set = useCallback(() => {
    const newObj = { id: 'id6', name: 'name6' }
    form.setFieldsValue({ ...newObj, info: showLabel(newObj) })
  }, [form])
  console.log('render')
  //   const onChange = value => {
  //     console.log(value)
  //   }
  return (
    <>
      <ProTable
        search={false}
        type="table"
        columns={[
          {
            title: '状态',
            key: 'state',
            dataIndex: 'state',
            valueType: 'select',
            valueEnum: {
              all: { text: '全部', status: 'Default' },
              open: {
                text: '未解决',
                status: 'Error',
              },
              closed: {
                text: '已解决',
                status: 'Success',
              },
            },
            editable: () => true,
          },
        ]}
        editable={{
          type: 'multiple',
        }}
        dataSource={[{ state: 'all' }, { state: 'open' }]}
        cardBordered={false}
        ghost
        pagination={false}
      ></ProTable>

      <Field
        text="100"
        valueType="select"
        valueEnum={{
          all: { text: '全部', status: 'Default' },
          open: {
            text: '未解决',
            status: 'Error',
          },
          closed: {
            text: '已解决',
            status: 'Success',
          },
        }}
        mode="edit"
      />
      <div style={{ marginBottom: '100px' }}></div>
      <Form onFinish={setData} form={form}>
        <ProFormSelectHOC name="info" label="test" fieldProps={fieldProps} needSyncNamePath={needSyncNamePath} />

        <Button htmlType="submit" type="primary">
          提交
        </Button>
        <Button onClick={set}>手动设置</Button>
      </Form>
      <div>结果：</div>
      {JSON.stringify(data)}
    </>
  )
}
