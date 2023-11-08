import React from 'react'
import { Spinner } from 'react-bootstrap'
export default function Loading() {
  return (
    <div className='p-5 d-flex justify-content-center'>
    <Spinner animation="border" role="status" variant="primary">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
    </div>
  )
}
