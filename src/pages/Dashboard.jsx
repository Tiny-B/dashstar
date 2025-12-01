import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskList from '../components/TaskList';
import TeamIconButton from '../components/TeamIconButton';
import './CSS/dashboard.css';

import avatarDefault from '../assets/avatardefault.svg';
import burgerMenuIcon from '../assets/BurgerMenuIcon.png';

const exampleTask = {
	id: 0,
	team_id: 0,
	create_by_user_id: 2,
	task_name: 'Check for bugs',
	task_desc: 'Make sure server.js runs without errors',
	date_due: null,
	status: 'open',
	task_xp: 10,
};

export default function Dashboard() {
	const { user, logout } = useAuth();
	const [level, setLevel] = useState(0);
	const [totalXp, setTotalXp] = useState(0);
	const [nextXp, setNextXp] = useState(0);
	const [xPSession, setXPSession] = useState(0);
	const [username, setUsername] = useState('');
	const [taskList, setTaskList] = useState([]);
	const [inprogressList, setInprogressList] = useState([]);
	const [completeList, setCompleteList] = useState([]);
	const [currentBoard, setCurrentBoard] = useState('Personal');

	useEffect(() => {
		// populate the task lists on load
		// only have and only will ever have 3 lists, sorry for the magic number :P
		// for (let i = 0; i < 3; i++) {
		// 	let status = '';
		// 	if (i === 0) {
		// 		status = 'open';
		// 	} else if (i === 1) {
		// 		status = 'inprogress';
		// 	} else {
		// 		status = 'complete';
		// 	}

		// 	const tempList = tasks.filter(task => task.status === status);

		// 	if (tempList.length !== 0) {
		// 		if (tempList[0].status === 'open') {
		// 			setTaskList(tempList);
		// 		} else if (tempList[0].status === 'inprogress') {
		// 			setInprogressList(tempList);
		// 		} else if (tempList[0].status === 'complete') {
		// 			setCompleteList(tempList);
		// 		}
		// 	}
		// }
		console.log('Dashboard', user);
		setLevel(user.level);
		setTotalXp(user.xp);
		setUsername(user.username);

		//example task
		setTaskList([exampleTask]);
	}, []);

	const createNewTask = task => {
		if (!task.task_name || !task.task_desc) {
			console.log('Task must have a name and a short description');
			return;
		}

		setTaskList([...taskList, task]);
	};

	const populateTeamIconButtons = () => {};

	const showCreateTaskModal = () => {};

	const showCreateNewTeamModal = () => {};

	const switchDashboard = () => {};

	const populateLists = () => {};

	const TaskListPlaceHolder = () => {
		const placeholderStyle = {
			height: '100%',
			width: '100%',
			color: '#eba8ffff',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			fontSize: '2rem',
			border: '2px solid rgb(76, 0, 57)',
			borderRadius: '20px',
		};
		return (
			<div style={placeholderStyle}>
				<p>No tasks in this list</p>
				{/* Maybe switch for an image here */}
				<p>(～￣▽￣)～</p>
			</div>
		);
	};

	const CreateTaskList = ({ title, list, showCreateBtn }) => {
		return (
			<TaskList
				title={title}
				showCreateBtn={showCreateBtn}
				onClickHandler={() => createNewTask(exampleTask)}
			>
				{list.length !== 0 ? (
					<ul className='task-list dash-bg dash-border dash-shadow'>
						{list.map(task => (
							<li key={task.id}>
								<TaskCard
									task_id={task.id}
									title={task.task_name}
									desc={task.task_desc}
								/>
							</li>
						))}
					</ul>
				) : (
					<TaskListPlaceHolder />
				)}
			</TaskList>
		);
	};

	return (
		<div className='dashboard'>
			<div className='dash-header'>
				<div className='burger-menu'>
					<img
						src={burgerMenuIcon}
						alt='Open menu icon'
					/>
				</div>

				<button onClick={() => logout()}>Logout</button>

				<h2 style={{ fontSize: '2rem' }}>{currentBoard}</h2>

				<div className='widgets'>
					<div className='level-widget dash-bg dash-border dash-shadow'>
						<div className='current-level'>
							<p>Level: {level}</p>
							<p>Total XP: {totalXp}</p>
						</div>
						<p>XP To Next: {nextXp}</p>
						<p>XP This session: {xPSession}</p>
					</div>
					<div className='profile-widget dash-bg dash-border dash-shadow'>
						<div className='user-info'>
							<p>{username}</p>
						</div>
						<div className='profile-pic'>
							<img
								src={avatarDefault}
								alt='user profile picture'
							/>
						</div>
					</div>
				</div>
			</div>
			{}
			<div className='dash-main'>
				{/* Add images for buttons here with onClick functionality */}
				<div className='dash-buttons dash-border dash-shadow'>
					<div
						className='team-buttons-alignment'
						style={{ marginBottom: '40px' }}
					>
						<TeamIconButton
							teamName={'Personal'}
							icon='🏠'
						/>
					</div>
					<div className='team-buttons-alignment'>
						<TeamIconButton
							teamName={'Create Team'}
							icon='+'
							fontSize={'2rem'}
							onClickHandler={() => console.log('click')}
						/>
					</div>
					<div className='team-buttons-alignment'>
						<TeamIconButton
							teamName={'Alpha Squad'}
							icon='▶'
						/>
					</div>
					<div className='dash-button dash-bg dash-border dash-shadow'>
						<p>■</p>
					</div>
					<div className='dash-button dash-bg dash-border dash-shadow'>
						<p>■</p>
					</div>
				</div>
				{}
				<div className='task-view-container dash-border dash-shadow'>
					<CreateTaskList
						title='Tasks'
						list={taskList}
						showCreateBtn={true}
					/>
					<CreateTaskList
						title='In-progress'
						list={inprogressList}
					/>
					<CreateTaskList
						title='Complete'
						list={completeList}
					/>
				</div>
			</div>
			{/* <div className='metrics-view-container dash-border dash-shadow'></div> */}
		</div>
	);
}
