import React from 'react'
import { useAccountTaskGlobally } from '../../../../context/AccountTaskContext'


const DocumentStep = () => {
    const {accountTaskData} = useAccountTaskGlobally();
  return (
    <>
    <h3>DocumentStep here</h3>
    <p>{JSON.stringify(accountTaskData)}</p>
    </>
  )
}

export default DocumentStep