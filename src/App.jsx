import './App.css';
import Sidebar from './components/Sidebar';
import MainContentLayout from './components/MainContentLayout';

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <MainContentLayout />
    </div>
  );
}

export default App;
