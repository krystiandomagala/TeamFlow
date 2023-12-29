import React from 'react';
import { Card } from 'react-bootstrap';
import AvatarMini from './AvatarMini';
export default function TeamItem({ team }) {
  function formatDateFromSeconds(seconds) {
    // Utworzenie obiektu Date z milisekund (1 sekunda = 1000 milisekund)
    const date = new Date(seconds * 1000);

    // Pobranie dnia, miesiąca i roku
    const day = date.getDate();
    const month = date.getMonth() + 1; // Miesiące są liczone od 0
    const year = date.getFullYear();

    // Formatowanie daty do postaci dd/mm/rrrr
    // Dodanie '0' na początku dla jednocyfrowych dni i miesięcy
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    return `${formattedDay}/${formattedMonth}/${year}`;
  }

  return (
    <Card className='team-item-container'>
      <Card.Header className='team-creation-date'>
        <div className='team-creation-date-header'>created at</div>
        {formatDateFromSeconds(team.createdAt.seconds)}</Card.Header>
      <Card.Body>
        <Card.Title className='ellipsis team-item-header'>{team.name}</Card.Title>
        <hr className='team-card-divider' />
        <p className='subtitle'>Opis teamu</p>
        <span className='mini-title'>Members</span>
        <div className='mt-1 d-flex'>
          {team.memberIds.slice(0, 3).map((user, index) => (
            <AvatarMini key={user} userId={user} />
          ))}

          {team.memberIds.length > 3 && (
            <span className='ps-2 num-of-hidden-users'>+{team.memberIds.length - 3}</span>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
