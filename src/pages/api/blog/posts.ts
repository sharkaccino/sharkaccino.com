import { type APIRoute } from "astro";
import { getCollection } from 'astro:content';
import compare from 'string-comparison';
import { type BlogAPIResults, type PostData } from "../../../util/blogPostTools";

export const prerender = false;

const posts = await getCollection(`blog`);

for (const i in posts) {
  // we're only using the rendered output of each post.
	// we can pretty safely toss the raw data
	posts[i].body = ``;
}

const exactrgx = /(?<!\w:)"(.+?)"/g
const keywordrgx = /(\w+?):"(.+?)"/g

const acquireTargets = (post: PostData) => {
  const output = [
    post.data.title,
    post.data.pubDate.toUTCString()
  ];

  if (post.body) {
    output.push(post.body);
  }

  if (post.data.editDate) {
    output.push(post.data.editDate.toUTCString());
  }

  if (post.data.tags) {
    output.push(...post.data.tags);
  }

  return output;
};

export const GET: APIRoute = async ({ params, request }): Promise<Response> => {
  console.debug(request);
  const urlparams = new URL(request.url).searchParams;

  let updatedPosts: PostData[] = [...posts];

  const query = urlparams.get(`search`);
  const sortMode = urlparams.get(`sort`) ?? `relevance`;
  const requestedPage = parseInt(urlparams.get(`page`) ?? ``) - 1 || 0;
  const requestedLimit = parseInt(urlparams.get(`limit`) ?? ``) || 20;
  const pageLimit = Math.max(0, Math.min(100, requestedLimit));

  let comparisonData: any = {};

  if (query != null) {
    // filter posts for exact string matching
    for (const match of [...query.matchAll(exactrgx)]) {
      const extractedString = match[1];

      updatedPosts = updatedPosts.filter((post) => {
        const targets = acquireTargets(post);

        for (const str of targets) {
          if (str.includes(extractedString)) return true;
        }
      });
    }

    // filter posts for keywords
    for (const match of [...query.matchAll(keywordrgx)]) {
      const keyword = match[1].toLowerCase();
      const value = match[2].toLowerCase();

      if ([`tag`, `tagged`, `tags`].includes(keyword)) {
        updatedPosts = updatedPosts.filter((post) => {
          if (post.data.tags == null) return false;

          for (const tag of post.data.tags) {
            if (tag.toLowerCase() === value) return true;
          }

          return false;
        });
      }
    }

    // compile fuzzy match data
    for (const post of updatedPosts) {
      let match = 0;
      
      const targets = acquireTargets(post);

      for (const target of targets) {
        const result = compare.diceCoefficient.similarity(query, target);
        match += result;
      }

      comparisonData[post.id] = match;
    }

    // final filter to remove almost entirely irrelevant results
    updatedPosts = updatedPosts.filter((post) => {
      return (comparisonData[post.id] > 0.005) 
    });

    // console.debug(comparisonData);
  }

  switch (sortMode) {
    case `oldestFirst`:
      updatedPosts.sort((a, b) => a.data.pubDate.getTime() - b.data.pubDate.getTime());
      break;
    case `recentlyUpdated`:
      updatedPosts.sort((a, b) => {
        const aTime = a.data.editDate;
        const bTime = b.data.editDate;

        if (aTime == null && bTime == null) {
          return b.data.pubDate.getTime() - a.data.pubDate.getTime();
        } else if (aTime == null) {
          return 1;
        } else if (bTime == null) {
          return -1;
        }

        return bTime.getTime() - aTime.getTime()
      });

      break;
    case `mostLiked`:
      // TODO
      // break;
    case `random`:
      // durstenfeld shuffle
      // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
      for (let i = updatedPosts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [updatedPosts[i], updatedPosts[j]] = [updatedPosts[j], updatedPosts[i]];
      }
      
      break;
    case `relevance`:
      if (query != null) {
        updatedPosts.sort((a, b) => {
          const aData = comparisonData[a.id];
          const bData = comparisonData[b.id];

          return bData - aData;
        });

        break;
      }

      // break statement intentionally omitted here
      // "relevance" defaults to "newest first" when 
      // there is no search query entered
    default:
      // default sort, newest first
      updatedPosts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  }

  const finalPosts = [];
  const maximumPages = Math.max(1, Math.ceil(updatedPosts.length / pageLimit));
  const pagesClamped = Math.min(Math.max(requestedPage, 0), maximumPages);
  const lowerLimit = pageLimit * pagesClamped;
  const upperLimit = Math.min(updatedPosts.length, lowerLimit + pageLimit);

  for (let i = lowerLimit; i < upperLimit; i++) {
    finalPosts.push(updatedPosts[i]);
  }

  const responseData: BlogAPIResults = {
    posts: finalPosts,
    pageNumber: pagesClamped,
    totalPages: maximumPages,
    filteredLength: updatedPosts.length
  }

  return new Response(
    JSON.stringify(responseData), 
    { 
      status: 200, 
      headers: {
        "Content-Type": `application/json; charset=utf-8`
      }
    }
  );
}