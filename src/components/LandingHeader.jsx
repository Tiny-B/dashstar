import { Link } from 'react-router-dom';
import './CSS/LandingHeader.css';

export default function LandingHeader() {
	return (
		<nav>
			<h1>Dashstar</h1>
			<div>
				<Link
					to='/login'
					state={{ fromLandingBtn: 'login' }}
				>
					<button style={{ color: 'white' }}>Login</button>
				</Link>
				<Link
					to='/login'
					state={{ fromLandingBtn: 'register' }}
				>
					<button style={{ color: 'white' }}>Register</button>
				</Link>
			</div>
		</nav>
	);
}
