import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './CSS/chatwidget.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ChatWidget() {
	const { user } = useAuth();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [selected, setSelected] = useState(null);
	const [messages, setMessages] = useState([]);
	const [messageText, setMessageText] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [editText, setEditText] = useState('');
	const [loading, setLoading] = useState(false);
	const [blocking, setBlocking] = useState(false);
	const [blockedIds, setBlockedIds] = useState([]);
	const [blockedByOther, setBlockedByOther] = useState(false);
	const [recentUsers, setRecentUsers] = useState([]);
	const [contextMenu, setContextMenu] = useState(null);
	const messagesEndRef = useRef(null);

	const isBlocked = useMemo(
		() => (selected ? blockedIds.includes(selected.id) : false),
		[selected, blockedIds]
	);

	useEffect(() => {
		// Load blocks once on mount to keep block state fresh even before opening
		loadBlocks();
	}, []);

	useEffect(() => {
		if (open) {
			loadBlocks();
			setSearch('');
			setSearchResults([]);
			setContextMenu(null);
			loadRecent();
		}
	}, [open]);

	useEffect(() => {
		if (selected) {
			setBlockedByOther(false);
			loadMessages(selected.id);
		} else {
			setMessages([]);
		}
	}, [selected]);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	useEffect(() => {
		const handleClick = () => setContextMenu(null);
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	}, []);

	const loadBlocks = async () => {
		if (!API_BASE) return;
		try {
			const res = await fetch(`${API_BASE}/messages/blocks`, {
				credentials: 'include',
			});
			if (res.ok) {
				const data = await res.json();
				setBlockedIds(data.map(b => b.blocked_user_id));
			}
		} catch (err) {
			console.error(err);
		}
	};

	const searchUsers = async q => {
		if (!API_BASE) return;
		const query = (q ?? '').trim();
		if (!query) {
			setSearchResults([]);
			return;
		}
	try {
		const res = await fetch(
			`${API_BASE}/messages/users/search?q=${encodeURIComponent(query)}`,
			{ credentials: 'include' }
		);
		if (!res.ok) throw new Error('search failed');
			const data = await res.json();
			setSearchResults(data);
		} catch (err) {
			console.error(err);
			setSearchResults([]);
		}
	};

	const updateRecentList = (userObj, lastMessage = null) => {
		if (!userObj) return;
		setRecentUsers(prev => {
			const filtered = prev.filter(u => u.id !== userObj.id);
			const entry = { ...userObj };
			if (lastMessage) {
				entry.lastMessage = lastMessage.content;
				entry.lastTime = lastMessage.time;
			}
			return [entry, ...filtered].slice(0, 15);
		});
	};

	const loadMessages = async otherId => {
		if (!API_BASE) return;
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/messages/users/${otherId}`, {
				credentials: 'include',
			});
			if (!res.ok) {
				if (res.status === 403) {
					setBlockedByOther(true);
					setMessages([]);
					return;
				}
				throw new Error('load failed');
			}
			const data = await res.json();
			setMessages(data);
			if (data.length > 0) {
				const last = data[data.length - 1];
				updateRecentList(selected, {
					content: last.content,
					time: new Date(last.createdAt || last.created_at).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					}),
				});
			}
		} catch (err) {
			console.error(err);
			setMessages([]);
		} finally {
			setLoading(false);
		}
	};

	const loadRecent = async () => {
		if (!API_BASE) return;
		try {
			const res = await fetch(`${API_BASE}/messages/recent`, {
				credentials: 'include',
			});
			if (!res.ok) return;
			const data = await res.json();
			setRecentUsers(data);
		} catch (err) {
			console.error(err);
		}
	};

	const clearConversation = async userId => {
		if (!API_BASE || !userId) return;
		try {
			await fetch(`${API_BASE}/messages/users/${userId}/all`, {
				method: 'DELETE',
				credentials: 'include',
			});
		} catch (err) {
			console.error(err);
		}
		setRecentUsers(prev => prev.filter(u => u.id !== userId));
		if (selected?.id === userId) {
			setSelected(null);
			setMessages([]);
		}
	};

	const sendMessage = async () => {
		if (!API_BASE || !selected) return;
		if (blockedByOther || blockedIds.includes(selected.id)) return;
		const text = messageText.trim();
		if (!text) return;
		setMessageText('');
		try {
			const res = await fetch(`${API_BASE}/messages/users/${selected.id}`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: text }),
			});
			if (!res.ok) {
				if (res.status === 403) {
					setBlockedByOther(true);
					return;
				}
				throw new Error('send failed');
			}
			const data = await res.json();
			setMessages(prev => [...prev, data]);
			updateRecentList(selected, {
				content: data.content,
				time: new Date(data.createdAt || data.created_at).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				}),
			});
			loadRecent();
		} catch (err) {
			console.error(err);
		}
	};

	const startEdit = msg => {
		setEditingId(msg.id);
		setEditText(msg.content);
	};

	const saveEdit = async () => {
		if (!API_BASE || !editingId || !editText.trim()) return;
		try {
			const res = await fetch(`${API_BASE}/messages/${editingId}`, {
				method: 'PATCH',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: editText.trim() }),
			});
			if (!res.ok) throw new Error('edit failed');
			const data = await res.json();
			setMessages(prev => prev.map(m => (m.id === data.id ? data : m)));
			setEditingId(null);
			setEditText('');
		} catch (err) {
			console.error(err);
		}
	};

	const deleteMessage = async id => {
		if (!API_BASE) return;
		try {
			const res = await fetch(`${API_BASE}/messages/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			if (!res.ok) throw new Error('delete failed');
			setMessages(prev => prev.filter(m => m.id !== id));
		} catch (err) {
			console.error(err);
		}
	};

	const blockUser = async () => {
		if (!API_BASE || !selected) return;
		setBlocking(true);
		try {
			const res = await fetch(`${API_BASE}/messages/block/${selected.id}`, {
				method: 'POST',
				credentials: 'include',
			});
			if (!res.ok) throw new Error('block failed');
			setBlockedIds(prev => [...prev, selected.id]);
		} catch (err) {
			console.error(err);
		} finally {
			setBlocking(false);
		}
	};

	const unblockUser = async () => {
		if (!API_BASE || !selected) return;
		setBlocking(true);
		try {
			const res = await fetch(`${API_BASE}/messages/block/${selected.id}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			if (!res.ok) throw new Error('unblock failed');
			setBlockedIds(prev => prev.filter(id => id !== selected.id));
			setBlockedByOther(false);
		} catch (err) {
			console.error(err);
		} finally {
			setBlocking(false);
		}
	};

	const blockUserById = async userId => {
		if (!API_BASE || !userId) return;
		setBlocking(true);
		try {
			await fetch(`${API_BASE}/messages/block/${userId}`, {
				method: 'POST',
				credentials: 'include',
			});
			setBlockedIds(prev => [...prev, userId]);
		} catch (err) {
			console.error(err);
		} finally {
			setBlocking(false);
		}
	};

	const handleKeyDown = e => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div className='chat-widget'>
			<button
				className='chat-toggle'
				onClick={() => setOpen(o => !o)}
				title='Messages'
			>
				Chat
			</button>

			{open && (
				<>
					<div className='chat-overlay' onClick={() => setOpen(false)} />
				<div className='chat-panel dash-bg dash-border dash-shadow'>
					<div className='chat-body instagram-layout'>
						<div className='chat-left'>
							<div className='chat-left-header'>
								<p className='chat-title'>Messages</p>
							</div>
							<div className='chat-search light'>
								<input
									value={search}
									onChange={e => {
										const val = e.target.value;
										setSearch(val);
										searchUsers(val);
									}}
									placeholder='Search'
								/>
							</div>
							<div className='chat-conversation-list'>
								{recentUsers.length === 0 && searchResults.length === 0 && (
									<p className='chat-hint'>Start a search to begin.</p>
								)}
								{(search ? searchResults : recentUsers).map(u => (
									<button
										key={`list-${u.id}`}
										className={`chat-convo-item ${selected?.id === u.id ? 'active' : ''}`}
										onClick={() => {
											setSelected(u);
											updateRecentList(u, {
												content: u.lastMessage || '',
												time: u.lastTime || '',
											});
											setContextMenu(null);
										}}
										onContextMenu={e => {
											e.preventDefault();
											setContextMenu({
												x: e.clientX,
												y: e.clientY,
												user: u,
											});
										}}
									>
										<div className='chat-convo-meta'>
											<p className='chat-name'>{u.username}</p>
										</div>
									</button>
								))}
							</div>
						</div>

						<div className='chat-right'>
							{loading && <p className='chat-hint'>Loading...</p>}
							{!loading && !selected && (
								<div className='chat-partner bar'>
									<p className='chat-name'>Select a conversation to start.</p>
									<div className='chat-actions'>
										<button
											onClick={() => {
												setOpen(false);
												setSelected(null);
												setMessages([]);
											}}
											className='chat-close-thread'
										>
											✕
										</button>
									</div>
								</div>
							)}
							{!loading && selected && (
								<>
									<div className='chat-partner bar'>
										<div>
											<p className='chat-name'>{selected.username}</p>
										</div>
										<div className='chat-actions'>
											<button
												onClick={() => {
													setOpen(false);
													setSelected(null);
													setMessages([]);
												}}
												className='chat-close-thread'
											>
												✕
											</button>
										</div>
									</div>
									<div className='chat-messages'>
										{messages.map(msg => {
											const mine = msg.sender_user_id === user?.id;
											const isEditing = editingId === msg.id;
											return (
												<div key={msg.id} className={`chat-message-row ${mine ? 'mine' : 'theirs'}`}>
													{!mine && (
														<div className='chat-avatar-bubble'>
															<span>{selected.username?.[0]?.toUpperCase()}</span>
														</div>
													)}
													<div className={`chat-message ${mine ? 'mine' : ''}`}>
														<div className='chat-message-meta'>
															<span>{mine ? 'You' : selected.username}</span>
															<span>
																{new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], {
																	hour: '2-digit',
																	minute: '2-digit',
																})}
															</span>
														</div>
														{isEditing ? (
															<div className='chat-edit-row'>
																<input
																	value={editText}
																	onChange={e => setEditText(e.target.value)}
																/>
																<button onClick={saveEdit}>Save</button>
																<button onClick={() => setEditingId(null)}>Cancel</button>
															</div>
														) : (
															<p className='chat-message-text'>{msg.content}</p>
														)}
													</div>
												</div>
											);
										})}
										<div ref={messagesEndRef} />
									</div>
									{(isBlocked || blockedByOther) && (
										<p className='chat-hint'>
											{isBlocked
												? 'You blocked this user. Unblock to continue.'
												: 'This user has blocked you. Messaging is disabled.'}
										</p>
									)}
									<div className='chat-input-row'>
										<textarea
											value={messageText}
											onChange={e => setMessageText(e.target.value)}
											onKeyDown={handleKeyDown}
											placeholder='Message...'
											disabled={isBlocked || blockedByOther}
										/>
										<button onClick={sendMessage} disabled={isBlocked || blockedByOther}>
											Send
										</button>
									</div>
								</>
							)}
						</div>
					</div>
					{contextMenu && (
						<div
							className='chat-context-menu'
							style={{ top: contextMenu.y, left: contextMenu.x }}
						>
							<button
								onClick={() => {
									if (contextMenu.user?.id) {
										clearConversation(contextMenu.user.id);
									}
									setContextMenu(null);
								}}
							>
								Delete conversation
							</button>
							{contextMenu.user && blockedIds.includes(contextMenu.user.id) ? (
								<button
									onClick={() => {
										if (contextMenu.user?.id) {
											setBlocking(true);
											fetch(`${API_BASE}/messages/block/${contextMenu.user.id}`, {
												method: 'DELETE',
												credentials: 'include',
											})
												.then(res => {
													if (!res.ok) throw new Error('unblock failed');
													setBlockedIds(prev => prev.filter(id => id !== contextMenu.user.id));
												})
												.catch(console.error)
												.finally(() => setBlocking(false));
										}
										setContextMenu(null);
									}}
								>
									Unblock user
								</button>
							) : (
								<button
									onClick={() => {
										if (contextMenu.user?.id) {
											blockUserById(contextMenu.user.id);
										}
										setContextMenu(null);
									}}
								>
									Block user
								</button>
							)}
						</div>
					)}
				</div>
				</>
			)}
		</div>
	);
}
