import { type GetServerSidePropsContext, type NextPage } from "next";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
const { WebClient } = require('@slack/web-api');


const SlackCallback: NextPage = () => {

  return (
    <div>
			Something went wrong!
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const { code, state } = context.query
	const result = await (new WebClient()).oauth.v2.access({
    client_id: env.SLACK_CLIENT_ID,
    client_secret: env.SLACK_CLIENT_SECRET,
    code,
  });

	if (result.ok && state) {
		try {
			const project = await prisma.project.findUnique({ where: { id: state.toString() }, include: { org: true }})
			if (!project) throw new Error('Invalid project')

			await prisma.slackInstallation.upsert({
				where: { projectId: state?.toString() },
				create: { 
					projectId: state.toString(),
					accessToken: result.access_token,
					teamId: result.team.id,
					teamName: result.team.name,
					botUserId: result.bot_user_id,
				},
				update: {
					accessToken: result.access_token,
					teamId: result.team.id,
					teamName: result.team.name,
					botUserId: result.bot_user_id,
				}
			})

			return {
				redirect: {
					destination: `/dashboard/${project.org.name}/${project.slug}/settings`
				}
			}
		} catch(e) {
			console.log(e)
		}
	} 
	
	return { props: { }}
}

export default SlackCallback;