import { ProFormSelect } from '@ant-design/pro-form'
import { ProFormPropsType } from '@ant-design/pro-form/es/components/SchemaForm'
import { ProFormFieldItemProps } from '@ant-design/pro-form/es/typing'
import { Button, Form, FormInstance, Select, Table, TableProps } from 'antd'
import { AnyObject } from 'antd/lib/_util/type'
import { NamePath } from 'antd/lib/form/interface'
import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
const getMock = (obj: any, key = ''): any => {
  if (Array.isArray(obj)) {
    return Array(((Math.random() * 3) | 0) + 2)
      .fill(0)
      .map((_, i) => getMock(obj[0], i))
  }
  if (obj === null) return null
  switch (typeof obj) {
    case 'string':
      return key + '(mock)'
    case 'number':
      return (Math.random() * 1000) | 0
    case 'object':
      const o: any = {}
      for (const k in obj) {
        o[k] = getMock(obj[k], k + '.' + key)
      }
      return o
  }
  return obj
}
const to = [
  { a: 1, b: { c: 1 }, d: { e: 1 } },
  { a: 1, b: { c: 1 }, d: { e: 2 } },
  { a: 1, b: { c: 2 }, d: { e: 1 } },
  { a: 1, b: { c: 2 }, d: { e: 2 } },
  { a: 1, b: { c: 3 }, d: { e: 1 } },
  { a: 1, b: { c: 3 }, d: { e: 2 } },
]
const obj = [
  { a: 1, b: [{ c: 1 }, { c: 2 }, { c: 3 }], d: [{ e: 1 }, { e: 2 }] },
  { a: 11, b: [{ c: 11 }, { c: 12 }, { c: 13 }], d: [{ e: 11 }, { e: 12 }] },
]

const arr = []
const flat = (y, w, arr) => {
  // console.log(JSON.stringify(y), '--------------', JSON.stringify(w))
  const y1 = { ...y }
  const w1 = { ...w }

  for (const k in w1) {
    const v = w1[k]
    delete w1[k]
    if (Array.isArray(v)) {
      for (const item of v) {
        y1[k] = item
        flat(y1, w1, arr)
      }
      // return v.map(item => {
      //   y1[k] = item
      //   return flat(y1, w1)
      // })
      return
    }
    y1[k] = v
  }
  arr.push(y1)
  // return y1
}
// getMock(obj)
// // obj.map(item => flat({}, item))

// console.log(
//   getMock(obj)
//     .map(item => flat({}, item))
//     .flat()
// )

const MergeCellsTable = <T extends AnyObject>(props: TableProps<T>): React.ReactElement => {
  const { dataSource } = props
  const newDataSource = useMemo(() => {
    const newDataSource: T[] = []
    // const flat = (oldObj: any, obj: any) => {
    //   const newObj = { ...obj }
    //   for (const k in newObj) {
    //     if (Array.isArray(newObj[k])) {
    //       // newObj[k]=
    //     }
    //   }
    //   return newObj
    // }

    getMock(dataSource).map(item => flat({}, item, newDataSource))
    return newDataSource
  }, [dataSource])
  console.log(newDataSource)
  return <Table {...props} dataSource={newDataSource}></Table>
}

export default MergeCellsTable
export const T = () => (
  <MergeCellsTable
    rowKey={item => JSON.stringify(item)}
    columns={[
      {
        title: '姓名',
        dataIndex: 'name',
      },
      {
        title: '住址',
        dataIndex: 'address',
        children: [
          {
            title: '省',
            dataIndex: ['address', 'p'],
          },
          {
            title: '城市',
            dataIndex: ['address', 'city'],
            children: [
              { title: '城市A', dataIndex: ['address', 'city', 'cityA'] },
              { title: '城市B', dataIndex: ['address', 'city', 'cityB'] },
            ],
          },
        ],
      },
    ]}
    dataSource={getMock([
      {
        name: '',
        address: [{ p: '', city: [{ cityA: '', cityB: '' }] }],
      },
    ])}
  />
)
