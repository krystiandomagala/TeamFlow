import React from 'react';

// Funkcja pomocnicza do generowania losowego koloru
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Komponent Avatar
const Avatar = ({ user }) => {
  const { avatarUrl, fullName } = user;
  const avatarLetter = fullName ? fullName[0].toUpperCase() : ''; // Pierwsza litera pełnej nazwy
  const backgroundColor = getRandomColor(); // Losowy kolor tła

  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        textAlign: 'center',
        lineHeight: '36px',
        fontSize: '18px',
        userSelect: 'none',
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={fullName} style={{ width: '100%', height: '100%' }} />
      ) : (
        avatarLetter
      )}
    </div>
  );
};

export default Avatar;


