import CardButton from './CardButton';
import './CSS/taskcard.css';

export default function TaskCard({ task, onStatusChange, userRole }) {
	return (
		<div className='task-card'>
			<p className='task-title'>{task.task_name}</p>
			<p className='task-desc'>{task.task_desc}</p>
			{task.assigned_to_username && (
				<p className='task-meta'>Assigned to: {task.assigned_to_username}</p>
			)}
			{task.completed_by_username && (
				<p className='task-meta'>Completed by: {task.completed_by_username}</p>
			)}
			<div className='task-buttons'>
				<CardButton
					taskId={task.id}
					initialStatus={task.status}
					onStatusChange={onStatusChange}
					userRole={userRole}
				/>
			</div>
		</div>
	);
}
