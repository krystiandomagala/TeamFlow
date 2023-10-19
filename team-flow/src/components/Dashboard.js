import React, { useState } from 'react'
import { Card, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const [error, setError] = useState('')
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    
    async function handleLogout(){
        setError('')
        
        try{
            await logout()
            navigate('/')
        } catch {
            setError('Failed to log out.')
        }
    }

  return (
    <>
        <Card>
            <Card.Body>
              <h1 className="text-center mb-2">Dashboard</h1>
              {error && <Alert variant="danger">{error}</Alert>}
                <strong>{currentUser.email}</strong>
            </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
            Forgot your password? <Link to='/settings' className="btn btn-primary">Reset password</Link>
        </div>
        <div className="w-100 text-center mt-2">
            <Button variant="link" onClick={handleLogout}>Log out</Button>
        </div>
    </>
  )
}
