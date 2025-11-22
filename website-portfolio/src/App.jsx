import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Naxbar from './components/Naxbar';
import Home from './pages/home';
import Login from './pages/login';

function App() {
	return (
		<Router>
			<Naxbar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
			</Routes>
		</Router>
	);
}

export default App;
