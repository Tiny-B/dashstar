import './CSS/taskcard.css';

export default function TaskCard({ title, desc }) {
	return (
		<div className='task-card'>
			<p className='task-title'>{title}</p>
			<p className='task-desc'>{desc}</p>
			<div className='task-buttons'>
				<button className='assign-button btn'>Assign</button>
				<button className='complete-button btn'>Complete</button>
			</div>
		</div>
	);
}
