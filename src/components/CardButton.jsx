import { useEffect, useState } from 'react';

export default function CardButton({ task_id, statusSetter }) {
	const [status, setStatus] = useState('open');

	useEffect(() => {
		statusSetter(status);
		// console.log('list after state change (via useEffect):', status);

		// const newData = tasks.map(element => {
		// 	if (element.id === task_id) {
		// 		return { ...element, status: status };
		// 	}
		// 	return element;
		// });
		// console.log('newData:', newData);
		// console.log('taskData', tasks);
	}, [status, statusSetter]);

	const ButtonStyle = {
		assign: {
			backgroundColor: 'rgb(56, 14, 134)',
		},
		complete: {
			backgroundColor: 'rgb(14, 134, 94)',
		},
	};

	const handleClick = () => {
		console.log('status before setState:', status);
		setStatus(prev => (prev === 'open' ? 'inprogress' : 'complete'));
	};

	if (status === 'complete') return null;

	return (
		<div>
			{status !== 'complete' ? (
				<button
					className='btn'
					style={status === 'open' ? ButtonStyle.assign : ButtonStyle.complete}
					onClick={handleClick}
				>
					{status === 'open' ? 'Assign' : 'Complete'}
				</button>
			) : (
				<></>
			)}
		</div>
	);
}
