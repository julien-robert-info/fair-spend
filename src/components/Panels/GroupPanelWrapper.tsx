'use client'
import React from 'react'
import {
	Alert,
	Box,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	SelectChangeEvent,
	Stack,
	Tab,
	Tabs,
	Typography,
} from '@mui/material'
import { GroupDetails } from '@/actions/group'
import { ShareMode } from '@prisma/client'
import { SummaryPanel } from '@/components/Panels/SummaryPanel'
import { HistoryPanel } from '@/components/Panels/HistoryPanel'
import GroupMenu from '../GroupMenu'
import { HistoryPeriod } from '@/utils/history'
import TabPanel from '../TabPanel'

const GroupPanelWrapper = ({
	group,
	isDesktop,
}: {
	group?: GroupDetails
	isDesktop: boolean
}) => {
	const [tab, setTab] = React.useState(0)
	const [historyPeriod, setHistoryPeriod] = React.useState<HistoryPeriod>(
		HistoryPeriod['1 mois']
	)

	const handleChangePeriod = (event: SelectChangeEvent) => {
		setHistoryPeriod(event.target.value as unknown as HistoryPeriod)
	}

	if (!group) {
		return
	}

	return (
		<Paper
			sx={{
				minHeight: '7em',
				width: isDesktop ? '46.5vw' : '97vw',
				my: 2,
				mx: isDesktop ? 1 : 'auto',
				p: 2,
			}}
		>
			{group && (
				<>
					<Stack
						direction='row'
						justifyContent='end'
						alignItems='center'
						gap={1}
						sx={{ mb: 1 }}
					>
						{group.members.length > 1 && (
							<>
								<Box sx={{ opacity: tab === 1 ? 1 : 0 }}>
									<FormControl
										size='small'
										disabled={tab !== 1}
									>
										<InputLabel id='period-select-label'>
											Période
										</InputLabel>
										<Select
											labelId='period-select-label'
											label='Période'
											value={historyPeriod.toString()}
											onChange={handleChangePeriod}
										>
											{Object.keys(HistoryPeriod)
												.filter(
													(key) => !isNaN(Number(key))
												)
												.map((key) => (
													<MenuItem
														value={key}
														key={key}
													>
														{
															HistoryPeriod[
																key as keyof typeof HistoryPeriod
															]
														}
													</MenuItem>
												))}
										</Select>
									</FormControl>
								</Box>
								<Tabs
									value={tab}
									onChange={(event, value) => setTab(value)}
									textColor='secondary'
									indicatorColor='secondary'
									aria-label='group-tab'
									variant='scrollable'
									scrollButtons='auto'
									sx={{ flexGrow: 1 }}
								>
									<Tab value={0} label='Solde' />
									<Tab value={1} label='Historique' />
								</Tabs>
							</>
						)}
						<GroupMenu group={group} />
					</Stack>
					<Box sx={{ position: 'relative' }}>
						{group.shareMode === ShareMode.FAIR &&
							group.members.some(
								(member) => member.isIncomeSet === false
							) && (
								<Alert severity='error' sx={{ mb: 2 }}>
									Dans un budget équitable, chaque membre doit
									saisir son revenu mensuel pour calculer la
									répartition des dépenses.
								</Alert>
							)}
						{group.members.length > 1 ? (
							<>
								<TabPanel value={tab} index={0}>
									<SummaryPanel group={group} />
								</TabPanel>
								<TabPanel value={tab} index={1}>
									<HistoryPanel
										group={group}
										historyPeriod={historyPeriod}
									/>
								</TabPanel>
							</>
						) : (
							<Typography>
								Invitez des membres avant de créer une dépense
								partagée
							</Typography>
						)}
					</Box>
				</>
			)}
		</Paper>
	)
}

export default GroupPanelWrapper
