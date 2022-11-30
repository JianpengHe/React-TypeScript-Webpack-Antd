import { useBoolean, useRequest } from 'ahooks'
import { Button, Modal } from 'antd'
import axios from 'axios'
import React, { useCallback } from 'react'

interface IProps {}
export const LongContent: React.FC<IProps> = ({}) => {
  const [open, { setTrue, setFalse }] = useBoolean(false)
  const { data, loading, run } = useRequest(axios.get, {
    manual: true,
    onSuccess() {
      setTrue()
    }
  })
  const onClick = useCallback(() => run('/'), [])

  return (
    <div>
      <Modal title="请求结果" open={open} onCancel={setFalse}>
        {String(data?.data || '')}
      </Modal>
      <Button loading={loading} onClick={onClick}>
        点击请求
      </Button>
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
