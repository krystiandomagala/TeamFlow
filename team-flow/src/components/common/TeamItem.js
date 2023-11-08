import React from 'react';
import { Card } from 'react-bootstrap';
export default function TeamItem({ team }) {
  return (
    <Card style={{ width: '18rem' }} className='mx-2'>
      <Card.Header className='text-right'>Created {team.createdAt.seconds}</Card.Header>
      <Card.Body>
        <Card.Title>{team.name}</Card.Title>
        <div>
          {'Users:'}
          {team.memberIds.map((user) => (
            <div key={user}>{user}</div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
