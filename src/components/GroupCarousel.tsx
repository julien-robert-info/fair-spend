'use client'
import React from 'react'
import GroupCard from './GroupCard'
import InviteCard from './InviteCard'
import Carousel from 'react-material-ui-carousel'
import { GroupDashboardProps } from './GroupStack'

const GroupCarousel: React.FC<GroupDashboardProps> = ({
	groups,
	invites,
	currentGroup,
	setCurrentGroup,
	handleOpenForm,
}) => {
	const [carouselIndex, setCarouselIndex] = React.useState(0)

	React.useEffect(() => {
		setCarouselIndex((carouselIndex) =>
			currentGroup
				? invites.length +
				  groups.findIndex((group) => group.id === currentGroup)
				: carouselIndex
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [groups, currentGroup])

	const handleChange = (now?: number) => {
		if (now && now > invites.length) {
			setCurrentGroup(groups[now - invites.length]?.id)
		} else {
			now && setCarouselIndex(now)
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
				...invites.map((invite, i) => (
					<InviteCard
						key={`invite-${i}`}
						group={invite.group}
						sx={{ minWidth: 180 }}
					/>
				)),
				...groups.map((group, i) => (
					<GroupCard
						key={`group-${i}`}
						group={group}
						edit={handleOpenForm}
						sx={{ minWidth: 180 }}
					/>
				)),
			]}
		</Carousel>
	)
}

export default GroupCarousel
