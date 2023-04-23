import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home';
import Navigation from './components/shared/Navigation/Navigation';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';


function App() {
  return (
    <Router>
   <Navigation/>
      <Routes>

        <Route path='/' exact element={<Home/>} />
      <Route path='/register'  element={<Register/>} />
      <Route path='/login'  element={<Login/>} />
      
      </Routes>


    </Router>
  );
}

export default App;
