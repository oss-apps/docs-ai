/* eslint-disable */
import { IndexStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import crypto from "crypto"
import { env } from "~/env.mjs";
import { WebClient } from '@slack/web-api'
import { getAnswerFromProject } from "~/server/api/routers/docGPT";
import slackify from "slackify-markdown";
import { getLinkDirectory } from "~/utils/link";

const verifySlackMessage = (timestamp: number, reqBody: string, signature: string) => {
	if ((Date.now() / 1000 - timestamp) > 60 * 5) {
		return false
	}

	const sigBaseString = 'v0:' + timestamp.toString() + ':' + reqBody

	const hmac = crypto.createHmac('sha256', env.SLACK_SIGINING_SECRET)
	const data = `v0=${hmac.update(sigBaseString).digest('hex')}`
	if (signature.length !== data.length) return false

	if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(data))) return false
	return true
}


const getInstallation = async (teamId: string) => {
	const result = await prisma.slackInstallation.findFirst({
		where: {
			teamId,
		},
		include: {
			project: true,
		}
	})

	return result
}

const handleEvent = async (event: any) => {
	if (event.type === 'app_mention') {
		const installation = await getInstallation(event.team)
		if (installation) {
			const text = event.text.replace(`<@${installation?.botUserId}>`, '')

			const web = new WebClient(installation.accessToken);

			console.log('Slack request:', text, installation.teamId, installation.projectId, event.team)

			const { answer, sources } = await getAnswerFromProject(installation.project.orgId, installation.projectId, text, installation.project.botName)

			const finalAnswer = `${answer}\n\nSources:\n${sources.split(',').map((link: string) => `[${getLinkDirectory(link)}](${link})`).join('\n')}`

			web.chat.postMessage({
				blocks: [{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: slackify(finalAnswer),
					}
				}],
				channel: event.channel,
			})
		}
	}
}

const slackHandler = (req: NextApiRequest, res: NextApiResponse) => {
	const slackSignature = req.headers['x-slack-signature']
	const timestamp = Number(req.headers['x-slack-request-timestamp'])
	const requestBody = JSON.stringify(req.body)

	if (!verifySlackMessage(timestamp, requestBody, slackSignature?.toString() || ''))
		return res.status(401).send({ message: 'unauthourised request' })

	if (req.body.type === 'url_verification') {
		return res.status(200).send({ challenge: req.body.challenge })
	}
	else {
		if (req.body.event) handleEvent(req.body.event)
	}

	res.status(200).send({ message: 'success' })
};

export default slackHandler;
