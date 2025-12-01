import { Link } from 'react-router-dom';
import GradientText from './GradientText';
import './CSS/LandingHeader.css';

export default function LandingHeader() {
	return (
		<div className='header'>
			<GradientText
				colors={[
					'rgb(76, 0, 57)',
					'rgb(98, 44, 114)',
					'rgb(76, 0, 57)',
					'rgb(98, 44, 114)',
					'rgb(76, 0, 57)',
				]}
				animationSpeed={3}
				showBorder={false}
				className='custom-class'
				fontSize='5rem'
			>
				Dashstar ⭐
			</GradientText>
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
