import './CSS/featuresection.css';

export default function FeatureSection({ features }) {
	return (
		<div className='outer-container overflow-hidden py-24 sm:py-32'>
			<div className='mx-auto max-w-7xl px-6 lg:px-8'>
				<div className='mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2'>
					<div className='lg:pt-4 lg:pr-8'>
						<div className='lg:max-w-lg'>
							<h2 className='text-base/7 font-semibold text-indigo-400'>
								Gamify your workload
							</h2>
							<p className='mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl'>
								A fun workflow
							</p>
							<p className='mt-6 text-lg/8 text-gray-300'>
								Easy and intuitive design with gamified elements to spruce up
								that monday workload rush, complete your tasks with a smile on
								your face, Dashstar brings some fun to mundane task management.
							</p>
							<dl className='mt-10 max-w-xl text-base/7 text-gray-400 lg:max-w-none'>
								{features.map(feature => (
									<div
										key={feature.name}
										className='feature relative pl-9'
									>
										<dt className='inline font-semibold text-white'>
											<div
												aria-hidden='true'
												className=' inline mr-10 size-5 text-indigo-400'
											>
												{feature.icon}
											</div>
											{feature.name}
										</dt>{' '}
										<dd className='inline'>{feature.description}</dd>
									</div>
								))}
							</dl>
						</div>
					</div>
					<img
						alt='Product screenshot'
						src='https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png'
						width={2432}
						height={1442}
						className='w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-228 md:-ml-4 lg:-ml-0 feat-img'
					/>
				</div>
			</div>
		</div>
	);
}
