import { type APIContext } from 'astro';
import { getCollection, render } from 'astro:content';
import rss, { type RSSFeedItem } from '@astrojs/rss';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/mdx';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { transform, walk, ELEMENT_NODE, parse, type Node } from 'ultrahtml';
import { getPostUrl, type PostData } from '../../util/blogPostTools';
import sanitize from 'ultrahtml/transformers/sanitize';
import swap from 'ultrahtml/transformers/swap';

export async function GET(context: APIContext) {
  let baseUrl = context.site?.href ?? `https://example.com`;
  if (baseUrl.endsWith(`/`)) baseUrl = baseUrl.slice(0, -1);

  const container = await AstroContainer.create({
    renderers: await loadRenderers([
      getContainerRenderer()
    ])
  });

  const posts: PostData[] = await getCollection(`blog`);
  posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const feedItems: RSSFeedItem[] = [];

  for (const post of posts) {
    const { Content } = await render(post);
    let rawHtmlContent = await container.renderToString(Content);

    if (post.data.imageUrl != null) {
      rawHtmlContent = `<img src="${post.data.imageUrl}" /><br/>${rawHtmlContent}`;
    }

    const finalContent = await transform(rawHtmlContent, [
      async (transformingNode) => {
        await walk(transformingNode, (node) => {
          if (node.type !== ELEMENT_NODE) return;
          if (node.name === `a` && node.attributes.href?.startsWith(`/`)) {
            node.attributes.href = baseUrl + node.attributes.href;
          }
          if (node.name === `img` && node.attributes.src?.startsWith(`/`)) {
            node.attributes.src = baseUrl + node.attributes.src;
          }
        });
        return transformingNode;
      },
      sanitize({ dropElements: [`script`, `style`] })
    ]);

    feedItems.push({
      title: post.data.title,
      pubDate: post.data.pubDate, 
      author: `jackie (sharkaccino)`,
      categories: post.data.tags,
      link: getPostUrl(post), 
      content: finalContent
    });
  }

  return rss({
    title: `sharkaccino`,
    description: `my name's jackie. i make stuff`,
    site: baseUrl,
    items: feedItems,
    customData: `<language>en-us</language>`
  });
};