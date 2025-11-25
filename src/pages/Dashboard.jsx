import { useState, useContext } from 'react';
import TaskCard from '../components/TaskCard';
import TaskList from '../components/TaskList';
import './CSS/dashboard.css';

import avatarDefault from '../assets/avatardefault.svg';

const fakeTaskLists = {
	tasks: [
		{
			id: 0,
			title: 'Fix bugs in main.js',
			desc: 'page keeps reloading when submit is clicked',
		},
		{
			id: 1,
			title: 'Fix bugs in main.js',
			desc: 'page keeps reloading when submit is clicked',
		},
		{
			id: 2,
			title: 'Fix bugs in main.js',
			desc: 'page keeps reloading when submit is clicked',
		},
		{
			id: 3,
			title: 'Fix bugs in main.js',
			desc: 'page keeps reloading when submit is clicked',
		},
		{
			id: 4,
			title: 'Fix bugs in main.js',
			desc: 'page keeps reloading when submit is clicked',
		},
	],
};

export default function Dashboard() {
	const [level, setLevel] = useState(5);
	const [totalXp, settotalXp] = useState(503);
	const [nextXp, setnextXp] = useState(25);
	const [xPSession, setxPSession] = useState(25);
	const [usersName, setusersName] = useState('Eri');
	const [usersSurname, setusersSurname] = useState('Belladonna');

	return (
		<div className='dashboard'>
			<div className='dash-header'>
				<div className='burger-menu'>
					<p>≡</p>
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
								alt=''
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
					<TaskList title={'Tasks'}>
						<ul className='task-list'>
							{fakeTaskLists.tasks.map(task => (
								<li key={task.id}>
									<TaskCard
										title={task.title}
										desc={task.desc}
									/>
								</li>
							))}
						</ul>
					</TaskList>
					<TaskList title={'In-progress'}>
						<ul className='task-list'>
							{fakeTaskLists.tasks.map(task => (
								<li key={task.id}>
									<TaskCard
										title={task.title}
										desc={task.desc}
									/>
								</li>
							))}
						</ul>
					</TaskList>
					<TaskList title={'Completed'}>
						<ul className='task-list'>
							{fakeTaskLists.tasks.map(task => (
								<li key={task.id}>
									<TaskCard
										title={task.title}
										desc={task.desc}
									/>
								</li>
							))}
						</ul>
					</TaskList>
				</div>
				{/* <div className='metrics-view-container'></div> */}
			</div>
		</div>
	);
}
