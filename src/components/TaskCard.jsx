import { useState, useEffect } from 'react';
import CardButton from './CardButton';
import './CSS/taskcard.css';

export default function TaskCard({ task_id, title, desc }) {
	const [statusForCard, setStatusForCard] = useState('');

	useEffect(() => {
		console.log('uplift callback:', statusForCard);
	}, [statusForCard]);

	const cardStatusSetter = status => {
		setStatusForCard(status);
	};

	return (
		<div className='task-card'>
			<p className='task-title'>{title}</p>
			<p className='task-desc'>{desc}</p>
			<div className='task-buttons'>
				<CardButton
					task_id={task_id}
					statusSetter={cardStatusSetter}
				/>
			</div>
		</div>
	);
}
