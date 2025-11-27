import { useState, useContext, useEffect } from 'react';
import TaskCard from '../components/TaskCard';
import TaskList from '../components/TaskList';
import './CSS/dashboard.css';

import tasks from '../../data/tasks.json';

import avatarDefault from '../assets/avatardefault.svg';
import burgerMenuIcon from '../assets/BurgerMenuIcon.png';

JSON.stringify(tasks);

export default function Dashboard() {
	const [level, setLevel] = useState(5);
	const [totalXp, settotalXp] = useState(503);
	const [nextXp, setnextXp] = useState(25);
	const [xPSession, setxPSession] = useState(25);
	const [usersName, setusersName] = useState('Eri');
	const [usersSurname, setusersSurname] = useState('Belladonna');
	const [taskList, setTaskList] = useState([]);
	const [inprogressList, setInprogressList] = useState([]);
	const [completeList, setCompleteList] = useState([]);

	useEffect(() => {
		// populate the task lists on load
		// only have and only will ever have 3 lists, sorry for the magic number :P
		for (let i = 0; i < 3; i++) {
			let status = '';
			if (i === 0) {
				status = 'open';
			} else if (i === 1) {
				status = 'inprogress';
			} else {
				status = 'complete';
			}

			const tempList = tasks.filter(task => task.status === status);

			if (tempList.length !== 0) {
				if (tempList[0].status === 'open') {
					setTaskList(tempList);
				} else if (tempList[0].status === 'inprogress') {
					setInprogressList(tempList);
				} else if (tempList[0].status === 'complete') {
					setCompleteList(tempList);
				}
			}
		}
	}, []);

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

	const CreateTaskList = () => {
		return (
			<TaskList title={'Tasks'}>
				{taskList.length !== 0 ? (
					<ul className='task-list'>
						{taskList.map(task => (
							<li key={task.id}>
								<TaskCard
									task_id={task.id}
									title={task.title}
									desc={task.desc}
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
	const CreateInprogressList = () => {
		return (
			<TaskList title={'In-progress'}>
				{inprogressList.length !== 0 ? (
					<ul className='task-list'>
						{inprogressList.map(task => (
							<li key={task.id}>
								<TaskCard
									task_id={task.id}
									title={task.title}
									desc={task.desc}
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
	const CreateCompleteList = () => {
		return (
			<TaskList title={'Complete'}>
				{completeList.length !== 0 ? (
					<ul className='task-list'>
						{completeList.map(task => (
							<li key={task.id}>
								<TaskCard
									task_id={task.id}
									title={task.title}
									desc={task.desc}
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
				<div className='widgets'>
					<div className='level-widget'>
						<div className='current-level'>
							<p>Level: {level}</p>
							<p>Total XP: {totalXp}</p>
						</div>
						<p>XP To Next: {nextXp}</p>
						<p>XP This session: {xPSession}</p>
					</div>
					<div className='profile-widget'>
						<div className='user-info'>
							<p>{usersName}</p>
							<p>{usersSurname}</p>
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
				<div className='dash-buttons'>
					<div className='dash-button'>
						<p>■</p>
					</div>
					<div className='dash-button'>
						<p>■</p>
					</div>
					<div className='dash-button'>
						<p>■</p>
					</div>
					<div className='dash-button'>
						<p>■</p>
					</div>
				</div>
				{}
				<div className='task-view-container'>
					<CreateTaskList />
					<CreateInprogressList />
					<CreateCompleteList />
				</div>
			</div>
			{/* <div className='metrics-view-container'></div> */}
		</div>
	);
}
