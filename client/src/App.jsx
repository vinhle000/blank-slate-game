import Lobby from './pages/Lobby';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Game from './pages/Game';
import Result from './pages/Result';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Lobby />} />
            <Route path='/game/:roomCode' element={<Game />} />
            <Route path='/results/:roomCode' element={<Result />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </>
  );
}

export default App;
