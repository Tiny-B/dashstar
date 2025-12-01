import { Link } from 'react-router-dom';
import GradientText from './GradientText';
import logo from '../assets/dash-logo.png';
import './CSS/LandingHeader.css';

export default function LandingHeader() {
	return (
		<div className='header'>
			<div className='header-brand'>
				<img
					src={logo}
					alt='Dashstar logo'
					className='logo mx-auto h-30 w-auto'
				/>
				<GradientText
					colors={[
						'rgb(87, 9, 41)',
						'rgb(144, 74, 165)',
						'rgb(122, 35, 71)',
						'rgb(144, 74, 165)',
						'rgb(87, 9, 41)',
					]}
					animationSpeed={3}
					showBorder={false}
					className='custom-class'
					fontSize='5rem'
				>
					Dashstar
				</GradientText>
			</div>

			<nav>
				<div>
					<Link
						to='/login'
						state={{ fromLandingBtn: 'login' }}
					>
						<button
							className='LandingHeaderBtn'
							style={{ color: 'white' }}
						>
							Login
						</button>
					</Link>
					<Link
						to='/login'
						state={{ fromLandingBtn: 'register' }}
					>
						<button
							className='LandingHeaderBtn'
							style={{ color: 'white' }}
						>
							Register
						</button>
					</Link>
				</div>
			</nav>
		</div>
	);
}
