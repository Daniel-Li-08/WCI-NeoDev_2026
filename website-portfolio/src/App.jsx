import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Naxbar from './components/Naxbar';
import Cart from './pages/cart';
import Home from './pages/home';
import Login from './pages/login';
import SignUp from './pages/sign-up';

function App() {
	return (
		<Router>
			<Naxbar />
			
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/sign-up" element={<SignUp />} />
				<Route path="/cart" element={<Cart />} />
			</Routes>
		</Router>
	);
}

export default App;
