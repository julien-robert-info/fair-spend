'use client'
import React from 'react'
import GroupCard from './GroupCard'
import InviteCard from './InviteCard'
import Carousel from 'react-material-ui-carousel'
import { GroupDashboardProps } from './GroupStack'

const GroupCarousel: React.FC<Omit<GroupDashboardProps, 'handleOpenForm'>> = ({
	groups,
	invites,
	currentGroup,
	setCurrentGroup,
}) => {
	const [carouselIndex, setCarouselIndex] = React.useState(0)

	React.useEffect(() => {
		if (invites.length === 0 && groups.length > 0) {
			setCurrentGroup(groups[0]?.id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	React.useEffect(() => {
		setCarouselIndex((carouselIndex) =>
			currentGroup
				? invites.length +
				  groups.findIndex((group) => group.id === currentGroup)
				: carouselIndex
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [groups, invites, currentGroup])

	const handleChange = (now?: number) => {
		//update currentGroup only if not an invite
		if (now !== undefined && now > invites.length - 1) {
			setCurrentGroup(groups[now - invites.length]?.id)
		} else {
			now && setCarouselIndex(now)
			setCurrentGroup(undefined)
		}
	}

	return (
		<Carousel
			index={carouselIndex}
			onChange={handleChange}
			autoPlay={false}
			animation='slide'
			navButtonsAlwaysVisible={true}
			cycleNavigation={false}
		>
			{...[
				...invites.map((invite) => (
					<InviteCard
						key={`invite-${invite.group.name}`}
						group={invite.group}
						sx={{ minWidth: 180 }}
					/>
				)),
				...groups.map((group) => (
					<GroupCard
						key={`group-${group.name}`}
						group={group}
						sx={{ minWidth: 180 }}
					/>
				)),
			]}
		</Carousel>
	)
}

export default GroupCarousel
