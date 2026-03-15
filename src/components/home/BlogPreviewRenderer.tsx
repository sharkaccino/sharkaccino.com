import { type Component, createSignal, For, Show } from "solid-js";
import { type BlogAPIResults, type PostData } from "../../util/blogPostTools";
import GridArticle from "../blog/GridArticle";
import style from "./BlogPreviewRenderer.module.scss";

// TODO: mobile support

const BlogPreviewRenderer: Component<{ postData?: PostData[] }> = (props) => {
  const [ getPosts, setPosts ] = createSignal<PostData[]|null>(null);

  fetch(`/api/blog/posts?limit=3`).then(async (response) => {
    const json: BlogAPIResults = await response.json();
    const posts: PostData[] = json.posts;

    // quick data validation
    // dates are not entirely serializable,
    // they only come in as numbers or strings
    for (const i in posts) {
      posts[i].data.pubDate = new Date(posts[i].data.pubDate);

      if (posts[i].data.editDate != null) {
        posts[i].data.editDate = new Date(posts[i].data.editDate);
      }
    }

    setPosts(posts);
    // console.debug(posts);
  });

  return (
    <div class={style.blogContainer}>
      <For each={getPosts()}>
        {(post) => {
          return (
            <GridArticle postData={post}/>
          )
        }}
      </For>
      <Show when={getPosts() != null && getPosts()?.length == 0}>
        <h2 class={style.noResults}>
          no blog posts yet. stay tuned!
        </h2>
      </Show>
  	</div>
  )
}

export default BlogPreviewRenderer;