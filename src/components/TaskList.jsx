import './CSS/tasklist.css';

export default function TaskList({ children, title }) {
	return (
		<div>
			<p className='list-title'>{title}</p>
			<div className='scroll-area'>
				<div className='list-wrapper'>{children}</div>
			</div>
		</div>
	);
}
