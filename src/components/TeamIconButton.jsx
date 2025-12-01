import { useState, useEffect } from 'react';
import './CSS/teamiconbutton.css';

export default function TeamIconButton({
	teamName,
	icon,
	fontSize,
	onClickHandler,
}) {
	const [isHovered, setIsHovered] = useState(false);

	const extraStyle = {
		fontSize: fontSize,
	};

	return (
		<div className='team-icon-container'>
			<div
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={onClickHandler}
				className='team-button dash-button dash-bg dash-border dash-shadow'
			>
				<p style={extraStyle}>{icon}</p>
			</div>

			<div className={`team-name-popup ${!isHovered ? 'fade' : ''}`}>
				<p>{teamName}</p>
			</div>
		</div>
	);
}
