import React from 'react';
import PropTypes from 'prop-types';

function Header({ username, roomCode }) {
  if (!username || !roomCode) return null;

  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted p-4 rounded-md text-sm sm:text-base shadow w-full max-w-md mb-4'>
      <span className='text-primary text-2xl font-boldold'>{`${username}`}</span>
      <span className='text-gray-500 sm:text-right'>Room: {roomCode}</span>
    </div>
  );
}

Header.propTypes = {
  username: PropTypes.string.isRequired,
  roomCode: PropTypes.string.isRequired,
};

export default Header;
