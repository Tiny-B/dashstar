import LandingHeader from '../components/LandingHeader';
import CarouselBanner from '../components/CarouselBanner';
import LandingFooter from '../components/LandingFooter';
import FeatureSection from '../components/FeatureSection';
import TextType from '../components/TextType';
import './CSS/landing.css';

const features = [
	{
		name: 'Manage your workflow.',
		description: 'Tasks created by admins, direct to your board.',
		icon: '*',
	},
	{
		name: 'Earn XP, Level up. Win.',
		description:
			'Complete tasks to earn xp, compete with your team or against other teams, work with goals.',
		icon: '*',
	},
	{
		name: 'Database backups.',
		description:
			'Everything is secured on a database, so no need to worry about losing your tasks.',
		icon: '*',
	},
];

export default function Landing() {
	return (
		<div className='landing'>
			<LandingHeader />
			<TextType
				className='tagline'
				text={[
					'Fun and intuitive task management',
					'Work happier with little rewards for doing tasks',
					'Earn badges, achievements and unlock secrets!!',
				]}
				typingSpeed={75}
				pauseDuration={1500}
				showCursor={true}
				cursorCharacter='|'
			/>
			<FeatureSection features={features} />
			<LandingFooter />
		</div>
	);
}


