import { ConfluencePagesLoader } from "langchain-notion/document_loaders/web/confluence";

const username = "Shrihari Mohan";
const accessToken = "ATATT3xFfGF0BevFg14ufodEkhOZD14hqXV_Uw_SWwcdhr6nYaDiOWQR2rUgmmBIN0-d_Bev4oC-Em-80bwHYVYGIjDzjNo4rhRPAr2N2STUHK5SAZ_XsoOiARJH5VmbQNRPo5XFi8yPYUuq6yosaZdX3b-ydJVHvX6lRlbYBTqKytvFRD7iWFk=F17A2411";


const confl = async () => {
  console.log("🔥 ~ confl ~ confl:")

  if (username && accessToken) {
    const loader = new ConfluencePagesLoader({
      baseUrl: "https://shriharipapa.atlassian.net/wiki",
      spaceKey: "~60e87e5a287807006852f370",
      username,
      accessToken,
    });

    const documents = await loader.load();
    console.log("🔥 ~ confl ~ documents:", documents)
  } else {
    console.log(
      "You must provide a username and access token to run this example."
    );
  }
}

console.log("something man")
confl().then(() => { console.log() }).catch(() => { console.log() })

export default confl

